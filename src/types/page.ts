import { CustomerType } from './model.ts';

export type WaitForCustomerResponseArgs = {
  nationalityId: string;
  trigger: () => Promise<void>;
};

export type WaitForQuotaResponse = {
  nationalityId: string;
  encryptedFamilyId?: string;
  selectedCustomerType: CustomerType;
};
