import type { CustomerType } from '../schemas/customer-response.ts';

export interface LoginArgs {
  phoneNumber: string;
  pin: string;
}

export interface FetchQuotaArgs {
  nationalityID: string;
  familyID: string;
  type: CustomerType;
}

export interface ResponseToQuotaDTOArgs {
  nationalityID: string;
  type: CustomerType;
}

export interface CustomerArgs {
  nationalityID: string;
  encryptedFamilyID: string;
  types: CustomerType[];
}

export interface QuotaArgs {
  nationalityID: string;
  type: CustomerType;
  quantity: number;
}
