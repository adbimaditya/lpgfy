import type { Page } from '@playwright/test';

import type { CustomerResponse } from '../schemas/customer-record.ts';
import type { CustomerFlags, CustomerType } from './types.ts';

export type GetQuotaRecord = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerType: CustomerType;
};

export type CreateCustomerArgs = {
  page: Page;
  args: CustomerArgs;
  selectedType: CustomerType;
};

export type CustomerArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  types: CustomerType[];
  flags: CustomerFlags;
};

export type CustomerResponseToCustomerScraperArgs = {
  page: Page;
  response: CustomerResponse;
};
