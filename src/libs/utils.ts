import fs from 'fs';
import path from 'path';

import {
  flaggedNationalityIdsSchema,
  nationalityIdsSchema,
  type Quota,
  quotasSchema,
} from '../schemas/file.ts';
import {
  FLAGGED_NATIONALITY_IDS_FILE_PATH,
  NATIONALITY_IDS_FILE_PATH,
  QUOTAS_FILE_PATH,
} from './constants.ts';
import type { CustomerType } from './types.ts';

export async function readFileAsync(filePath: string) {
  const data = await fs.promises.readFile(filePath, 'utf-8');

  return JSON.parse(data);
}

export async function writeFileAsync(filePath: string, data: unknown) {
  await ensureDirectoryExists(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function encodeCustomerType(type: CustomerType) {
  return type.replace(' ', '+');
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

export async function updateQuotasFile(quota: Quota) {
  const filePath = QUOTAS_FILE_PATH;
  const quotas = await ensureQuotasFileExists();

  await writeFileAsync(filePath, [...quotas, quota]);
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

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
