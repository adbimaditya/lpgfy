import { z } from 'zod';

import { CHANNEL_INJECTS, CUSTOMER_TYPES, NATIONALITY_ID_LENGTH } from '../libs/constants.ts';
import { createResponseSchema } from './response.ts';

export const nationalityIdSchema = z.string().length(NATIONALITY_ID_LENGTH);
export const familyIdSchema = z.string().length(NATIONALITY_ID_LENGTH).optional();
export const familyIdEncryptedSchema = z.string().optional();
export const customerTypeSchema = z.enum(CUSTOMER_TYPES);
export const sourceTypeIdSchema = z.union([z.literal(1), z.literal(2), z.literal(99)]);
export const statusSchema = z.union([z.literal(1), z.literal(2)]);
export const channelInjectSchema = z.enum(CHANNEL_INJECTS);

export const customerRecordSchema = z.object({
  nationalityId: nationalityIdSchema,
  familyId: familyIdSchema,
  familyIdEncrypted: familyIdEncryptedSchema,
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  customerTypes: z.array(
    z.object({
      name: customerTypeSchema,
      sourceTypeId: sourceTypeIdSchema,
      status: statusSchema,
      verifications: z.array(z.unknown()),
      merchant: z.object({ name: z.string(), mid: z.string(), address: z.string() }).nullable(),
      isBlocked: z.boolean(),
      isQuotaValid: z.boolean(),
    }),
  ),
  channelInject: channelInjectSchema,
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
