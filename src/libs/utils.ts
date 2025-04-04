import { type BrowserContextOptions, chromium, type LaunchOptions } from '@playwright/test';
import asyncRetry, { type RetryFunction } from 'async-retry';
import fs from 'fs';
import path from 'path';

import {
  flaggedNationalityIdsSchema,
  nationalityIdsSchema,
  profileSchema,
  type Quota,
  quotasSchema,
} from '../schemas/file.ts';
import type { CloseBrowserArgs, CloseBrowserOnErrorArgs, CreateBrowserArgs } from './args.ts';
import {
  FLAGGED_NATIONALITY_IDS_FILE_PATH,
  MY_LUCKY_NUMBER,
  PROFILE_FILE_PATH,
  QUOTAS_FILE_PATH,
} from './constants.ts';
import logger, { playwrightLogger } from './logger.ts';
import type { CustomerType, Result } from './types.ts';

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export async function retry(callback: RetryFunction<void, Error>) {
  await asyncRetry(callback, {
    retries: MY_LUCKY_NUMBER,
    onRetry: (err) => {
      logger.error(`🔴 ${err.message}`);
    },
  });
}

export function isEmpty(data: unknown[]) {
  return data.length === 0;
}

export function isFirstIteration(index: number) {
  return Boolean(index === 0);
}

export function encodeCustomerType(customerType: CustomerType) {
  return customerType.replace(' ', '+');
}

export async function readFileAsync(filePath: string) {
  const data = await fs.promises.readFile(filePath, 'utf-8');

  return JSON.parse(data);
}

export async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export async function writeFileAsync(filePath: string, data: unknown) {
  await ensureDirectoryExists(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function deleteFileAsync(filePath: string) {
  await fs.promises.unlink(filePath);
}

export async function ensureFlaggedNationalityIdsFileExists(nationalityIdsFilePath: string) {
  const { data: flaggedNationalityIdsFile, error: readError } = await tryCatch(
    readFileAsync(FLAGGED_NATIONALITY_IDS_FILE_PATH),
  );

  if (readError) {
    const nationalityIdsFile = await readFileAsync(nationalityIdsFilePath);
    const { data: nationalityIds, error: parseError } = await tryCatch(
      nationalityIdsSchema.parseAsync(nationalityIdsFile),
    );

    if (parseError) {
      return null;
    }

    const flaggedNationalityIds = nationalityIds.map((nationalityId) => ({
      nationalityId,
      flag: false,
    }));

    await writeFileAsync(FLAGGED_NATIONALITY_IDS_FILE_PATH, flaggedNationalityIds);

    return flaggedNationalityIds;
  }

  const flaggedNationalityIds = flaggedNationalityIdsSchema.parse(flaggedNationalityIdsFile);

  return flaggedNationalityIds;
}

export async function updateFlaggedNationalityIdsFile(nationalityId: string) {
  const flaggedNationalityIdsFile = await readFileAsync(FLAGGED_NATIONALITY_IDS_FILE_PATH);
  const flaggedNationalityIds = flaggedNationalityIdsSchema.parse(flaggedNationalityIdsFile);

  await writeFileAsync(
    FLAGGED_NATIONALITY_IDS_FILE_PATH,
    flaggedNationalityIds.map((flaggedNationalityId) => ({
      ...flaggedNationalityId,
      flag: flaggedNationalityId.nationalityId === nationalityId || flaggedNationalityId.flag,
    })),
  );
}

export async function getProfileFromFile() {
  const profileFile = await readFileAsync(PROFILE_FILE_PATH);
  const profile = profileSchema.parse(profileFile);

  return profile;
}

export async function ensureQuotasFileExists() {
  const { data: quotasFile, error } = await tryCatch(readFileAsync(QUOTAS_FILE_PATH));

  if (error) {
    const quotas: Quota[] = [];

    await writeFileAsync(QUOTAS_FILE_PATH, quotas);

    return quotas;
  }

  const quotas = quotasSchema.parse(quotasFile);

  return quotas;
}

export function getUniqueQuotas(quotas: Quota[], newQuota: Quota) {
  return [...quotas, newQuota].filter(
    (quota, index, self) =>
      self.findIndex((q) => q.nationalityId === quota.nationalityId) === index,
  );
}

export async function updateQuotasFile(quota: Quota) {
  const quotas = await ensureQuotasFileExists();

  await writeFileAsync(QUOTAS_FILE_PATH, getUniqueQuotas(quotas, quota));
}

export async function createBrowser({
  launchOptions = {},
  browserContextOptions = {},
}: CreateBrowserArgs = {}) {
  const defaultLaunchOptions: LaunchOptions = {
    headless: false,
    args: ['--start-maximized'],
    logger: playwrightLogger,
    ...launchOptions,
  };

  const defaultBrowserContextOptions: BrowserContextOptions = {
    viewport: null,
    ...browserContextOptions,
  };

  const browser = await chromium.launch(defaultLaunchOptions);
  const context = await browser.newContext(defaultBrowserContextOptions);
  const page = await context.newPage();

  return { browser, context, page };
}

export async function closeBrowser({ browser }: CloseBrowserArgs) {
  const contexts = browser.contexts();

  for (const context of contexts) {
    const pages = context.pages();

    for (const page of pages) {
      await page.close();
    }

    await context.close();
  }

  await browser.close();
}

export async function closeBrowserOnError({ browser, callback }: CloseBrowserOnErrorArgs) {
  const { error } = await tryCatch(callback());

  if (error) {
    await closeBrowser({ browser });
  }
}
