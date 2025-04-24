import asyncRetry, { type RetryFunction } from 'async-retry';
import { InvalidOptionArgumentError } from 'commander';

import { MY_LUCKY_NUMBER } from './constants.ts';
import logger from './logger.ts';
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

export function parseInteger(value: string) {
  const parsedValue = parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError('Not a number.');
  }
  return parsedValue;
}
