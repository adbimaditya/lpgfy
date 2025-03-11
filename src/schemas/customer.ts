import { z } from 'zod';

import { NATIONALITY_ID_LENGTH } from '../libs/constants.ts';

import { createResponseSchema } from './response.ts';

export const nationalityIDSchema = z.string().length(NATIONALITY_ID_LENGTH);
export const nationalityIDsSchema = z.array(nationalityIDSchema);
export const familyIDSchema = z.string().length(NATIONALITY_ID_LENGTH).optional();
export const customerTypeNameSchema = z.enum(['Rumah Tangga', 'Usaha Mikro', 'Pengecer']);
export const customerFlagsSchema = z.object({
  isAgreedTermsConditions: z.boolean(),
  isCompleted: z.boolean(),
  isSubsidi: z.boolean(),
  isRecommendationLetter: z.boolean(),
  isBlocked: z.boolean(),
  isBusinessType: z.boolean(),
  isBusinessName: z.boolean(),
});

export const customerTypeSchema = z.object({
  name: customerTypeNameSchema,
  sourceTypeId: z.union([z.literal(1), z.literal(2), z.literal(99)]),
  status: z.union([z.literal(1), z.literal(2)]),
  verifications: z.array(z.unknown()),
  merchant: z.object({ name: z.string(), mid: z.string(), address: z.string() }).nullable(),
  isBlocked: z.boolean(),
  isQuotaValid: z.boolean(),
});

export const customerDTOSchema = z.object({
  nationalityID: nationalityIDSchema,
  encryptedFamilyID: z.string().optional(),
  types: z.array(customerTypeNameSchema),
  flags: customerFlagsSchema,
});

export const baseCustomerDataSchema = z.object({
  nationalityId: nationalityIDSchema,
  familyId: familyIDSchema,
  familyIdEncrypted: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  customerTypes: z.array(customerTypeSchema),
  channelInject: z.enum(['tnp2k', 'maplite', 'bpum']),
  token: z.string(),
  countDownTime: z.number(),
});

export const customerDataSchema = baseCustomerDataSchema.merge(customerFlagsSchema);
export const customerResponseSchema = createResponseSchema(customerDataSchema);

export type CustomerType = z.infer<typeof customerTypeNameSchema>;
export type CustomerFlags = z.infer<typeof customerFlagsSchema>;
export type CustomerDTO = z.infer<typeof customerDTOSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
