import type { Browser, BrowserContextOptions, LaunchOptions, Page } from '@playwright/test';

import Customer from '../models/customer.ts';
import type { CustomerResponse } from '../schemas/customer-record.ts';
import type { FlaggedNationalityId, Profile } from '../schemas/file.ts';
import type { QuotaRecord } from '../schemas/quota-record.ts';
import type { CustomerFlags, CustomerType } from './types.ts';

export type LoginArgs = {
  identifier: string;
  pin: string;
};

export type GetQuotaAllocationArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  selectedCustomerType: CustomerType;
};

export type CustomerArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerTypes: {
    name: CustomerType;
    mid: string | null;
  }[];
  customerFlags: CustomerFlags;
  profile: Profile;
};

export type CreateCustomerArgs = {
  page: Page;
  customerArgs: CustomerArgs;
  selectedCustomerType: CustomerType;
};

export type CustomerResponseToCustomerArgs = {
  customerResponse: CustomerResponse;
  profile: Profile;
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
  customer: Customer;
};

export type ScrapQuotaArgs = {
  page: Page;
  flaggedNationalityId: FlaggedNationalityId;
};

export type CreateBrowserArgs = {
  launchOptions?: LaunchOptions;
  browserContextOptions?: BrowserContextOptions;
};

export type CloseBrowserArgs = {
  browser: Browser;
};

export type CloseBrowserOnErrorArgs = {
  browser: Browser;
  callback: () => Promise<void>;
};
