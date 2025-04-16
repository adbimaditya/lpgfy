import fs from 'fs';
import path from 'path';

import {
  flaggedNationalityIdsSchema,
  flaggedOrdersSchema,
  nationalityIdsSchema,
  ordersSchema,
  profileSchema,
  quotasSchema,
  transactionsSchema,
} from '../schemas/file.ts';
import {
  FLAGGED_NATIONALITY_IDS_FILE_PATH,
  FLAGGED_ORDERS_FILE_PATH,
  PROFILE_FILE_PATH,
  QUOTAS_FILE_PATH,
  TRANSACTIONS_FILE_PATH,
} from './constants.ts';
import type { Quota, Transaction } from './types.ts';
import { tryCatch } from './utils.ts';

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

export async function updateQuotasFile(quota: Quota) {
  const quotas = await ensureQuotasFileExists();

  await writeFileAsync(QUOTAS_FILE_PATH, [...quotas, quota]);
}

export async function ensureTransactionsFileExists() {
  const { data: transactionsFile, error } = await tryCatch(readFileAsync(TRANSACTIONS_FILE_PATH));

  if (error) {
    const transactions: Transaction[] = [];

    await writeFileAsync(TRANSACTIONS_FILE_PATH, transactions);

    return transactions;
  }

  const transactions = transactionsSchema.parse(transactionsFile);

  return transactions;
}

export async function updateTransactionsFile(transaction: Transaction) {
  const transactions = await ensureTransactionsFileExists();

  await writeFileAsync(TRANSACTIONS_FILE_PATH, [...transactions, transaction]);
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

export async function ensureFlaggedOrdersFileExists(ordersFilePath: string) {
  const { data: flaggedOrdersFile, error: readError } = await tryCatch(
    readFileAsync(FLAGGED_ORDERS_FILE_PATH),
  );

  if (readError) {
    const ordersFile = await readFileAsync(ordersFilePath);
    const { data: orders, error: parseError } = await tryCatch(ordersSchema.parseAsync(ordersFile));

    if (parseError) {
      return null;
    }

    const flaggedOrders = orders.map((order) => ({
      ...order,
      flag: false,
    }));

    await writeFileAsync(FLAGGED_ORDERS_FILE_PATH, flaggedOrders);

    return flaggedOrders;
  }

  const flaggedOrders = flaggedOrdersSchema.parse(flaggedOrdersFile);

  return flaggedOrders;
}

export async function updateFlaggedOrdersFile(nationalityId: string) {
  const flaggedOrdersFile = await readFileAsync(FLAGGED_ORDERS_FILE_PATH);
  const flaggedOrders = flaggedOrdersSchema.parse(flaggedOrdersFile);

  await writeFileAsync(
    FLAGGED_ORDERS_FILE_PATH,
    flaggedOrders.map((flaggedOrder) => ({
      ...flaggedOrder,
      flag: flaggedOrder.nationalityId === nationalityId || flaggedOrder.flag,
    })),
  );
}
