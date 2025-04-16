import { z } from 'zod';

import { nationalityIdSchema } from './customer-record.ts';
import { createResponseSchema } from './response.ts';

export const profileRecordSchema = z.object({
  registrationId: z.string(),
  name: z.string(),
  address: z.string(),
  cityId: z.string(),
  city: z.string(),
  province: z.string(),
  coordinate: z.string(),
  storeName: z.string(),
  storeAddress: z.string(),
  phoneNumber: z.string(),
  tid: z.string(),
  mid: z.null(),
  spbu: z.string(),
  merchantType: z.string(),
  midMap: z.string(),
  isSubsidiProduct: z.boolean(),
  storePhoneNumber: z.string(),
  email: z.string(),
  nationalityId: nationalityIdSchema,
  ditrictName: z.string(),
  villageName: z.string(),
  zipcode: z.string(),
  agen: z.object({
    id: z.string(),
    name: z.string(),
  }),
  isActiveMyptm: z.boolean(),
  bank: z.object({
    bankName: z.string().nullable(),
    accountName: z.string().nullable(),
    accountNumber: z.string().nullable(),
  }),
  myptmActivationStatus: z.null(),
  isAvailableTransaction: z.boolean(),
});

export const profileResponseSchema = createResponseSchema(profileRecordSchema);
