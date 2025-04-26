import Customer from '../models/customer.ts';
import type { CustomerScrapperConstructorArgs } from './constructor.ts';
import type { CustomerType, Quota } from './model.ts';

export type GetCustomerScrapperArgs = {
  selectedCustomerType: CustomerType;
  customerScrapperConstructorArgs: CustomerScrapperConstructorArgs;
};

export type GetQuotaFromResponseArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  selectedCustomerType: CustomerType;
  isValid: boolean;
};

export type GetQuotaArgs = {
  customer: Customer;
  selectedCustomerType: CustomerType;
  options?: {
    redirect: boolean;
  };
};

export type ScrapQuotaArgs = GetQuotaArgs;

export type IsQuotaEligibleArgs = {
  quota: Quota;
  orderQuantity: number;
};

export type ProcessOrderArgs = {
  nationalityId: string;
  customerType: CustomerType;
  orderQuantity: number;
};

export type GenerateFromQuotaArgs = {
  quota: Quota;
  quantity: number;
};

export type GenerateFromQuotasArgs = {
  quotas: Quota[];
  orderQuantity: number;
};

export type GetTransactionFromResponseArgs = {
  nationalityId: string;
  customerType: CustomerType;
  orderQuantity: number;
};

export type GetTransactionArgs = GetTransactionFromResponseArgs;
