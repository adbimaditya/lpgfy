import type { Browser, BrowserContextOptions, LaunchOptions, Page } from '@playwright/test';

import Customer from '../models/customer.ts';
import type {
  CustomerFlags,
  CustomerResponse,
  CustomerType,
  FlaggedNationalityId,
  FlaggedOrder,
  Order,
  Profile,
  Quota,
  QuotaResponse,
  TransactionResponse,
} from './types.ts';

export type CustomerArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerTypes: {
    name: CustomerType;
    mid: string | null;
    isQuotaValid: boolean;
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

export type QuotaResponseToQuotaAllocationArgs = {
  quotaResponse: QuotaResponse;
  customerType: CustomerType;
  isValid: boolean;
};

export type TransactionResponseToTransactionArgs = {
  transactionResponse: TransactionResponse;
  order: Order;
};

export type WaitForCustomerArgs = {
  nationalityId: string;
  trigger: () => Promise<void>;
};

export type WaitForQuotaAllocationArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  selectedCustomerType: CustomerType;
  isValid: boolean;
};

export type LoginArgs = {
  identifier: string;
  pin: string;
};

export type ScrapQuotaAllocationArgs = {
  page: Page;
  customer: Customer;
  selectedCustomerType: CustomerType;
  options?: {
    redirect: boolean;
  };
};

export type ScrapQuotaAllocationsArgs = {
  page: Page;
  customer: Customer;
};

export type ScrapQuotaArgs = {
  page: Page;
  flaggedNationalityId: FlaggedNationalityId;
};

export type CreateOrderArgs = {
  page: Page;
  flaggedOrder: FlaggedOrder;
};

export type GenerateOrdersFromQuotasArgs = {
  quotas: Quota[];
  quantity: number;
};

export type ScrapQuotasActionArgs = {
  file: string;
};

export type CreateOrdersActionArgs = {
  file: string;
};

export type GenerateOrdersFromQuotasActionArgs = {
  quantity: number;
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
