import fs from 'fs';
import path from 'path';

import {
  flaggedNationalityIdsSchema,
  nationalityIdsSchema,
  type Quota,
  quotasSchema,
} from '../schemas/file.ts';
import type { CloseBrowserOnErrorArgs } from './args.ts';
import {
  FLAGGED_NATIONALITY_IDS_FILE_PATH,
  NATIONALITY_IDS_FILE_PATH,
  QUOTAS_FILE_PATH,
} from './constants.ts';
import type { CustomerType, Result } from './types.ts';

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export function isEmpty(data: unknown[]) {
  return data.length === 0;
}

export function isFirstIteration(index: number) {
  return index === 0;
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

export async function ensureFlaggedNationalityIdsFileExists() {
  const filePath = FLAGGED_NATIONALITY_IDS_FILE_PATH;
  const { data: flaggedNationalityIdsFile, error } = await tryCatch(readFileAsync(filePath));

  if (error) {
    const nationalityIdsFile = await readFileAsync(NATIONALITY_IDS_FILE_PATH);
    const nationalityIds = nationalityIdsSchema.parse(nationalityIdsFile);
    const flaggedNationalityIds = nationalityIds.map((nationalityId) => ({
      nationalityId,
      flag: false,
    }));

    await writeFileAsync(filePath, flaggedNationalityIds);

    return flaggedNationalityIds;
  }

  const flaggedNationalityIds = flaggedNationalityIdsSchema.parse(flaggedNationalityIdsFile);

  return flaggedNationalityIds;
}

export async function updateFlaggedNationalityIdsFile(nationalityId: string) {
  const filePath = FLAGGED_NATIONALITY_IDS_FILE_PATH;
  const flaggedNationalityIdsFile = await readFileAsync(filePath);
  const flaggedNationalityIds = flaggedNationalityIdsSchema.parse(flaggedNationalityIdsFile);

  await writeFileAsync(
    filePath,
    flaggedNationalityIds.map((flaggedNationalityId) => ({
      ...flaggedNationalityId,
      flag: flaggedNationalityId.nationalityId === nationalityId || flaggedNationalityId.flag,
    })),
  );
}

export async function ensureQuotasFileExists() {
  const filePath = QUOTAS_FILE_PATH;
  const { data: quotasFile, error } = await tryCatch(readFileAsync(filePath));

  if (error) {
    const quotas: Quota[] = [];

    await writeFileAsync(filePath, quotas);

    return quotas;
  }

  const quotas = quotasSchema.parse(quotasFile);

  return quotas;
}

export async function updateQuotasFile(quota: Quota) {
  const filePath = QUOTAS_FILE_PATH;
  const quotas = await ensureQuotasFileExists();

  await writeFileAsync(filePath, [...quotas, quota]);
}

export async function closeBrowserOnError({
  page,
  context,
  browser,
  callback,
}: CloseBrowserOnErrorArgs) {
  const { error } = await tryCatch(callback());

  if (error) {
    console.log({ error, message: error.message });

    await page.close();
    await context.close();
    await browser.close();
  }
}
