import status from 'http-status';

import FlaggedNationalityIDsFile from '../models/flagged-nationality-ids-file.ts';
import Quota from '../models/quota.ts';
import QuotasFile from '../models/quotas-file.ts';
import { customerResponseSchema } from '../schemas/customer.ts';
import { quotaResponseSchema } from '../schemas/quota.ts';

import type {
  CloseCarouselArgs,
  FetchQuotaArgs,
  LoginArgs,
  LogoutArgs,
  ScrapQuotasArgs,
  VerifyNationalityIDArgs,
} from './args.ts';
import { QUOTA_ENDPOINT, VERIFY_NATIONALITY_ID_ENDPOINT } from './constants.ts';
import { responseToCustomerDTO, responseToQuotaDTO } from './dto.ts';
import { createCustomer, createQuota } from './factory.ts';
import type { Customer } from './interfaces.ts';
import { encodeCustomerType } from './utils.ts';

export async function login({ page, phoneNumber, pin }: LoginArgs) {
  await page.getByPlaceholder('Email atau No. Handphone').fill(phoneNumber);
  await page.getByPlaceholder('PIN (6-digit)').fill(pin);
  await page.getByRole('button', { name: 'Masuk' }).click();
}

export async function logout({ page }: LogoutArgs) {
  await page.getByTestId('btnLogout').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keluar' }).click();
}

export async function closeCarousel({ page }: CloseCarouselArgs) {
  await page.getByTestId(/btnClose*/).click();
}

export async function scrapQuotas({ page, nationalityID }: ScrapQuotasArgs) {
  const customer = await verifyNationalityID({ page, nationalityID });
  if (!customer) {
    await FlaggedNationalityIDsFile.update(nationalityID);

    return;
  }

  const quota = await customer.getQuota(page);
  if (!quota) {
    await FlaggedNationalityIDsFile.update(nationalityID);

    return;
  }

  await streamQuotas(quota);
  await page.getByTestId('btnChangeBuyer').click();
}

export async function verifyNationalityID({
  page,
  nationalityID,
}: VerifyNationalityIDArgs): Promise<Customer | null> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.request().url() ===
        `${VERIFY_NATIONALITY_ID_ENDPOINT}?nationalityId=${nationalityID}`,
  );

  await page.getByPlaceholder('Masukkan 16 digit NIK KTP Pelanggan').fill(nationalityID);
  await page.getByRole('heading', { name: 'NIK KTP Pelanggan' }).click();
  await page.getByRole('button', { name: 'Cek' }).click();

  const response = await responsePromise;
  if (!response.ok() && response.status() === status.NOT_FOUND) {
    await page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();

    return null;
  }

  if (!response.ok() && response.status() === status.BAD_REQUEST) {
    return null;
  }

  const apiResponse = await response.json();
  const customerResponse = customerResponseSchema.parse(apiResponse);
  const customerDTO = responseToCustomerDTO({
    ...customerResponse,
    data: { ...customerResponse.data, nationalityId: nationalityID },
  });

  const [selectedType] = customerDTO.types;
  const customer = createCustomer({ args: customerDTO, selectedType });

  return customer;
}

export async function fetchQuota({
  page,
  nationalityID,
  encryptedFamilyID,
  type,
}: FetchQuotaArgs): Promise<Quota> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.request().url() ===
        `${QUOTA_ENDPOINT(nationalityID)}?familyId=${encryptedFamilyID ? encodeURIComponent(encryptedFamilyID) : ''}&customerType=${encodeCustomerType(type)}`,
  );

  const response = await responsePromise;
  const apiResponse = await response.json();
  const quotaResponse = quotaResponseSchema.parse(apiResponse);
  const quotaDTO = responseToQuotaDTO({ response: quotaResponse, nationalityID, type });
  const quota = createQuota(quotaDTO);

  return quota;
}

export async function streamQuotas(quota: Quota) {
  await QuotasFile.update(quota);
  await FlaggedNationalityIDsFile.update(quota.getNationalityID());
}
