import type { Browser, BrowserContextOptions, LaunchOptions } from '@playwright/test';
import type {
  CustomerResponse,
  CustomerType,
  Profile,
  QuotaResponse,
  TransactionResponse,
} from './model.ts';

export type CreateBrowserArgs = {
  launchOptions?: LaunchOptions;
  browserContextOptions?: BrowserContextOptions;
};

export type CloseBrowserOnErrorArgs = {
  browser: Browser;
  callback: () => Promise<void>;
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

export type MapCustomerResponseToCustomerArgs = {
  customerResponse: CustomerResponse;
  profile: Profile;
};

export type MapQuotaResponseToQuotaArgs = {
  quotaResponse: QuotaResponse;
  nationalityId: string;
  customerType: CustomerType;
  isValid: boolean;
};

export type MapTransactionResponseToTransactionArgs = {
  transactionResponse: TransactionResponse;
  nationalityId: string;
  customerType: CustomerType;
  orderQuantity: number;
};

export type MapQuotaToOrderArgs = {
  nationalityId: string;
  customerType: CustomerType;
  quotaQuantity: number;
  orderQuantity: number;
};

export type LoginArgs = {
  identifier: string;
  pin: string;
};

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
