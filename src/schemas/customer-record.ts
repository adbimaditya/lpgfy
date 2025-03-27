import { z } from 'zod';

import { FAMILY_ID_LENGTH, NATIONALITY_ID_LENGTH } from '../libs/constants.ts';
import { createResponseSchema } from './response.ts';

export const customerTypeSchema = z.enum(['Rumah Tangga', 'Usaha Mikro', 'Pengecer']);

export const customerRecordSchema = z.object({
  nationalityId: z.string().length(NATIONALITY_ID_LENGTH),
  familyId: z.string().length(FAMILY_ID_LENGTH).optional(),
  familyIdEncrypted: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  customerTypes: z.array(
    z.object({
      name: customerTypeSchema,
      sourceTypeId: z.union([z.literal(1), z.literal(2), z.literal(99)]),
      status: z.union([z.literal(1), z.literal(2)]),
      verifications: z.array(z.unknown()),
      merchant: z.object({ name: z.string(), mid: z.string(), address: z.string() }).nullable(),
      isBlocked: z.boolean(),
      isQuotaValid: z.boolean(),
    }),
  ),
  channelInject: z.enum(['tnp2k', 'maplite', 'bpum']),
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

export const customerResponseSchema = createResponseSchema(customerRecordSchema);

export type CustomerType = z.infer<typeof customerTypeSchema>;
export type CustomerRecord = z.infer<typeof customerRecordSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
