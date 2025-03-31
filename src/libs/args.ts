import type { Page } from '@playwright/test';

import Customer from '../models/customer.ts';
import type { CustomerResponse } from '../schemas/customer-record.ts';
import type { FlaggedNationalityId } from '../schemas/file.ts';
import type { QuotaRecord } from '../schemas/quota-record.ts';
import type { CustomerFlags, CustomerType } from './types.ts';

export type GetQuotaAllocationArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  selectedCustomerType: CustomerType;
};

export type CustomerArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerTypes: CustomerType[];
  customerFlags: CustomerFlags;
};

export type CreateCustomerArgs = {
  page: Page;
  customerArgs: CustomerArgs;
  selectedCustomerType: CustomerType;
};

export type CustomerResponseToCustomerArgs = {
  customerResponse: CustomerResponse;
};

export type QuotaRecordToQuotaAllocationArgs = {
  customerType: CustomerType;
  quotaRecord: QuotaRecord;
};

export type ScrapQuotaAllocationArgs = {
  page: Page;
  customer: Customer;
  selectedCustomerType: CustomerType;
};

export type ScrapQuotaAllocationsArgs = {
  page: Page;
  nationalityId: string;
  customerTypes: CustomerType[];
};

export type ScrapQuotaArgs = {
  page: Page;
  flaggedNationalityId: FlaggedNationalityId;
};
