import { input, password } from '@inquirer/prompts';
import ora from 'ora';
import path from 'path';

import { identifierSchema, pinSchema } from '../schemas/auth.ts';
import { quotasSchema } from '../schemas/file.ts';
import type {
  CreateOrdersActionArgs,
  GenerateOrdersFromQuotasActionArgs,
  ScrapQuotasActionArgs,
} from './args.ts';
import {
  FLAGGED_NATIONALITY_IDS_FILE_PATH,
  FLAGGED_ORDERS_FILE_PATH,
  ORDERS_FILE_PATH,
  QUOTAS_FILE_PATH,
} from './constants.ts';
import {
  deleteFileAsync,
  ensureFlaggedNationalityIdsFileExists,
  ensureFlaggedOrdersFileExists,
  readFileAsync,
  writeFileAsync,
} from './file.ts';
import {
  createOrders,
  generateOrdersFromQuotas,
  getIsAuthenticated,
  login,
  logout,
  scrapQuotas,
} from './my-pertamina.ts';
import { retry, tryCatch } from './utils.ts';

export async function loginAction() {
  const spinner = ora('Logging in...');

  const isAuthenticated = await getIsAuthenticated();

  if (isAuthenticated) {
    spinner.info('You are already logged in.');
    return;
  }

  const identifier = await input({
    message: 'Please enter your email address or phone number:',
    required: true,
    validate: (value) => {
      const { success } = identifierSchema.safeParse(value);

      if (!success) {
        return 'Invalid identifier. Please enter a valid email address or a phone number with 10 to 13 digits.';
      }

      return true;
    },
  });

  const pin = await password({
    message: 'Enter your 6-digit PIN:',
    validate: (value) => {
      const { success } = pinSchema.safeParse(value);

      if (!success) {
        return 'Invalid PIN. Please enter exactly 6 digits.';
      }

      return true;
    },
  });

  spinner.start();
  await retry(() => login({ identifier, pin }));
  spinner.succeed('You have successfully logged in.');
}

export async function logoutAction() {
  const spinner = ora('Logging out...');

  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    spinner.info('You are not logged in.');
    return;
  }

  spinner.start();
  await retry(() => logout());
  spinner.succeed('You have successfully logged out.');
}

export async function scrapQuotasAction({ file }: ScrapQuotasActionArgs) {
  const spinner = ora('Scraping quotas...');

  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    ora().info(
      'You must be logged in to perform this task. Please use the login command to authenticate.',
    );
    return;
  }

  const nationalityIdFilePath = path.resolve(file);
  const flaggedNationalityIds = await ensureFlaggedNationalityIdsFileExists(nationalityIdFilePath);

  if (!flaggedNationalityIds) {
    ora().fail(
      `The file at ${nationalityIdFilePath} is either missing or contains data in an unexpected format. Please ensure the file exists and adheres to the required structure.`,
    );
    return;
  }

  spinner.start();
  await retry(() => scrapQuotas(flaggedNationalityIds));
  spinner.succeed('Quota scraping completed successfully.');
}

export async function createOrdersAction({ file }: CreateOrdersActionArgs) {
  const spinner = ora('Creating orders...');

  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    spinner.info(
      'You must be logged in to perform this task. Please use the login command to authenticate.',
    );
    return;
  }

  const ordersFilePath = path.resolve(file);
  const flaggedOrders = await ensureFlaggedOrdersFileExists(ordersFilePath);

  if (!flaggedOrders) {
    spinner.fail(
      `The file at ${ordersFilePath} is either missing or contains data in an unexpected format. Please ensure the file exists and adheres to the required structure.`,
    );
    return;
  }

  spinner.start();
  await retry(() => createOrders(flaggedOrders));
  spinner.succeed('Orders creation completed successfully.');
}

export async function generateOrdersFromQuotasAction({
  quantity,
}: GenerateOrdersFromQuotasActionArgs) {
  const spinner = ora('Generating orders...').start();

  const { data: quotasFile, error: readError } = await tryCatch(readFileAsync(QUOTAS_FILE_PATH));

  if (readError) {
    spinner.fail(
      `Failed to read quotas file at ${QUOTAS_FILE_PATH}. Please ensure the file exists and is accessible.`,
    );
    return;
  }

  const quotas = quotasSchema.parse(quotasFile);

  await writeFileAsync(ORDERS_FILE_PATH, generateOrdersFromQuotas({ quotas, quantity }));

  spinner.succeed('Generate orders completed successfully.');
}

export async function clearDataAction() {
  const spinner = ora('Clearing data...').start();

  await deleteFileAsync(FLAGGED_NATIONALITY_IDS_FILE_PATH);
  await deleteFileAsync(FLAGGED_ORDERS_FILE_PATH);

  spinner.succeed('Clear data completed successfully.');
}
