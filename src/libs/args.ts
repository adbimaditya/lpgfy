import type { Page } from '@playwright/test';

import type { CustomerDTO, CustomerType } from '../schemas/customer.ts';
import type { QuotaDTO, QuotaResponse } from '../schemas/quota.ts';

export type CustomerArgs = CustomerDTO;
export type QuotaArgs = QuotaDTO;

export type LoginArgs = {
  page: Page;
  phoneNumber: string;
  pin: string;
};

export type LogoutArgs = {
  page: Page;
};

export type CloseCarouselArgs = {
  page: Page;
};

export type ScrapQuotasArgs = {
  page: Page;
  nationalityID: string;
};

export type VerifyNationalityIDArgs = {
  page: Page;
  nationalityID: string;
};

export type FetchQuotaArgs = {
  page: Page;
  nationalityID: string;
  encryptedFamilyID?: string;
  type: CustomerType;
};

export type ResponseToQuotaDTOArgs = {
  response: QuotaResponse;
  nationalityID: string;
  type: CustomerType;
};

export type CreateCustomerArgs = {
  args: CustomerArgs;
  selectedType: CustomerType;
};
