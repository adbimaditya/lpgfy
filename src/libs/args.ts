import type { CustomerType } from '../schemas/customer-record.ts';

export type GetQuotaRecord = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerType: CustomerType;
};
