import type { Page } from '@playwright/test';
import status from 'http-status';

import type { FetchQuotaArgs, LoginArgs } from '../lib/args.ts';
import { QUOTA_ENDPOINT, VERIFY_NATIONALITY_ID_ENDPOINT } from '../lib/constants.ts';
import { responseToCustomerDTO, responseToQuotaDTO } from '../lib/dto.ts';
import { customerResponseSchema } from '../schemas/customer-response.ts';
import { quotaResponseSchema } from '../schemas/quota-response.ts';

import { encodeCustomerType } from './utils.ts';

export async function login(page: Page, { phoneNumber, pin }: LoginArgs) {
  await page.getByPlaceholder('Email atau No. Handphone').fill(phoneNumber);
  await page.getByPlaceholder('PIN (6-digit)').fill(pin);
  await page.getByRole('button', { name: 'Masuk' }).click();
}

export async function logout(page: Page) {
  await page.getByTestId('btnLogout').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keluar' }).click();
}

export async function closeCarousel(page: Page) {
  await page.getByTestId(/btnClose*/).click();
}

export async function verifyNationalityID(page: Page, nationalityID: string) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.request().url() ===
        `${VERIFY_NATIONALITY_ID_ENDPOINT}?nationalityId=${nationalityID}`,
  );

  await page.getByPlaceholder('Masukkan 16 digit NIK KTP Pelanggan').fill(nationalityID);
  await page.getByRole('button', { name: 'Cek' }).click();

  const response = await responsePromise;
  if (!response.ok() && response.status() === status.NOT_FOUND) {
    return null;
  }

  const apiResponse = await response.json();
  const customerResponse = customerResponseSchema.parse(apiResponse);

  return {
    ...responseToCustomerDTO(customerResponse, nationalityID),
    familyID: customerResponse.data.familyIdEncrypted,
  };
}

export async function fetchQuota(page: Page, { nationalityID, familyID, type }: FetchQuotaArgs) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().url() ===
      `${QUOTA_ENDPOINT(nationalityID)}?familyId=${encodeURIComponent(familyID)}&customerType=${encodeCustomerType(type)}`,
  );

  const response = await responsePromise;
  const apiResponse = await response.json();
  const quotaResponse = quotaResponseSchema.parse(apiResponse);

  return responseToQuotaDTO(quotaResponse, { nationalityID, type });
}
