import type { Page } from '@playwright/test';
import status from 'http-status';

import Customer from '../models/customer.ts';
import Quota from '../models/quota.ts';
import { customerResponseSchema, type CustomerType } from '../schemas/customer-response.ts';
import { quotaResponseSchema } from '../schemas/quota-response.ts';

import type { LoginArgs } from './args.ts';
import { QUOTA_ENDPOINT, VERIFY_NATIONALITY_ID_ENDPOINT } from './constants.ts';
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

export async function verifyNationalityID(
  page: Page,
  nationalityID: string,
): Promise<Customer | null> {
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
  const customer = Customer.fromResponse({
    ...customerResponse,
    data: { ...customerResponse.data, nationalityId: nationalityID },
  });

  if (customer.hasMultipleTypes()) {
    await selectCustomerType(page, customer.getSelectedType());
  }

  return customer;
}

export async function fetchQuota(page: Page, customer: Customer): Promise<Quota> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().url() ===
      `${QUOTA_ENDPOINT(customer.getNationalityID())}?familyId=${encodeURIComponent(customer.getEncryptedFamilyID())}&customerType=${encodeCustomerType(customer.getSelectedType())}`,
  );

  const response = await responsePromise;
  const apiResponse = await response.json();
  const quotaResponse = quotaResponseSchema.parse(apiResponse);
  const quota = Quota.fromResponse(quotaResponse, customer);

  return quota;
}

export async function selectCustomerType(page: Page, selectedType: CustomerType) {
  await page.getByRole('dialog').getByTestId(`radio-${selectedType}`).check();
  await page.getByRole('dialog').getByRole('button', { name: 'Lanjut Transaksi' }).click();

  if (selectedType === 'Usaha Mikro') {
    await page.getByRole('button', { name: 'Lewati, Lanjut Transaksi' }).click();
  }
}
