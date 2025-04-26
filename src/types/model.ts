import { z } from 'zod';

import {
  CHANNEL_INJECTS,
  CUSTOMER_TYPES,
  PAYMENT_TYPES,
  PRODUCT_TYPES,
  STATUS,
} from '../libs/constants.ts';
import { customerRecordSchema, customerResponseSchema } from '../schemas/customer-record.ts';
import {
  flaggedNationalityIdSchema,
  flaggedOrderSchema,
  orderSchema,
  profileSchema,
  quotaSchema,
  transactionSchema,
} from '../schemas/file.ts';
import { profileRecordSchema, profileResponseSchema } from '../schemas/profile-record.ts';
import { quotaRecordSchema, quotaResponseSchema } from '../schemas/quota-record.ts';
import { responseSchema } from '../schemas/response.ts';
import {
  transactionRecordSchema,
  transactionResponseSchema,
} from '../schemas/transaction-record.ts';

export type CustomerType = (typeof CUSTOMER_TYPES)[number];
export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type ProductType = (typeof PRODUCT_TYPES)[number];
export type ChannelInject = (typeof CHANNEL_INJECTS)[number];
export type Status = (typeof STATUS)[number];

export type CustomerFlags = {
  isAgreedTermsConditions: boolean;
  isCompleted: boolean;
  isSubsidy: boolean;
  isRecommendationLetter: boolean;
  isBlocked: boolean;
  isBusinessType: boolean;
  isBusinessName: boolean;
};

export type CustomerTypeDetails = {
  name: CustomerType;
  mid: string | null;
  isQuotaValid: boolean;
};

export type Profile = z.infer<typeof profileSchema>;
export type Quota = z.infer<typeof quotaSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Transaction = z.infer<typeof transactionSchema>;

export type FlaggedNationalityId = z.infer<typeof flaggedNationalityIdSchema>;
export type FlaggedOrder = z.infer<typeof flaggedOrderSchema>;

export type ProfileRecord = z.infer<typeof profileRecordSchema>;
export type CustomerRecord = z.infer<typeof customerRecordSchema>;
export type QuotaRecord = z.infer<typeof quotaRecordSchema>;
export type TransactionRecord = z.infer<typeof transactionRecordSchema>;

export type Response = z.infer<typeof responseSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
export type QuotaResponse = z.infer<typeof quotaResponseSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
