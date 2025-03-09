import { z } from 'zod';

import { createResponseSchema } from './response.ts';

export const customerTypeName = z.enum(['Rumah Tangga', 'Usaha Mikro']);

export const customerTypeSchema = z.object({
  name: customerTypeName,
  sourceTypeId: z.union([z.literal(1), z.literal(99)]),
  status: z.union([z.literal(1), z.literal(2)]),
  verifications: z.array(z.unknown()),
  merchant: z.object({ name: z.string(), mid: z.string(), address: z.string() }).nullable(),
  isBlocked: z.boolean(),
  isQuotaValid: z.boolean(),
});

export const customerDataSchema = z.object({
  nationalityId: z.string(),
  familyId: z.string(),
  familyIdEncrypted: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  customerTypes: z.array(customerTypeSchema),
  channelInject: z.enum(['tnp2k', 'maplite']),
  isAgreedTermsConditions: z.boolean(),
  isCompleted: z.boolean(),
  isSubsidi: z.boolean(),
  isRecommendationLetter: z.boolean(),
  isBlocked: z.boolean(),
  isBusinessType: z.boolean(),
  isBusinessName: z.boolean(),
  token: z.string(),
  countDownTime: z.number(),
});

export const customerResponseSchema = createResponseSchema(customerDataSchema);

export type CustomerType = z.infer<typeof customerTypeName>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
