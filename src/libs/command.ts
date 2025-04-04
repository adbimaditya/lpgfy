import { input, password } from '@inquirer/prompts';
import ora from 'ora';
import path from 'path';

import { identifierSchema, pinSchema } from '../schemas/auth.ts';
import { getIsAuthenticated, login, logout, scrapQuotas } from './my-pertamina.ts';
import type { ScrapQuotasActionArgs } from './types.ts';
import { ensureFlaggedNationalityIdsFileExists, retry } from './utils.ts';

export async function loginAction() {
  const isAuthenticated = await getIsAuthenticated();

  if (isAuthenticated) {
    ora().info('You are already logged in.');
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

  const spinner = ora('Logging in...');

  spinner.start();
  await retry(() => login({ identifier, pin }));
  spinner.succeed('You have successfully logged in.');
}

export async function logoutAction() {
  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    ora().info('You are not logged in.');
    return;
  }

  const spinner = ora('Logging out...');

  spinner.start();
  await retry(() => logout());
  spinner.succeed('You have successfully logged out.');
}

export async function scrapQuotasAction({ file }: ScrapQuotasActionArgs) {
  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    ora().info(
      'You must be logged in to perform this task. Please use the login command to authenticate.',
    );
    return;
  }

  const filePath = path.resolve(file);
  const flaggedNationalityIds = await ensureFlaggedNationalityIdsFileExists(filePath);

  if (!flaggedNationalityIds) {
    ora().fail(
      `The file at ${filePath} is either missing or contains data in an unexpected format. Please ensure the file exists and adheres to the required structure.`,
    );
    return;
  }

  const spinner = ora('Scraping quotas...');

  spinner.start();
  await retry(() => scrapQuotas(flaggedNationalityIds));
  spinner.succeed('Quota scraping completed successfully.');
}
