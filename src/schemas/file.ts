import z from 'zod';

import { CUSTOMER_TYPES, NATIONALITY_ID_LENGTH } from '../libs/constants.ts';

export const nationalityIdSchema = z.string().length(NATIONALITY_ID_LENGTH);
export const nationalityIdsSchema = z.array(nationalityIdSchema);
export const flaggedNationalityIdSchema = z.object({
  nationalityId: nationalityIdSchema,
  flag: z.boolean(),
});
export const flaggedNationalityIdsSchema = z.array(flaggedNationalityIdSchema);

export const quotaAllocationSchema = z.object({
  type: z.enum(CUSTOMER_TYPES),
  quantity: z.number(),
});
export const quotaSchema = z.object({
  nationalityId: nationalityIdSchema,
  allocations: z.array(quotaAllocationSchema),
});
export const quotasSchema = z.array(quotaSchema);

export type FlaggedNationalityId = z.infer<typeof flaggedNationalityIdSchema>;
export type QuotaAllocation = z.infer<typeof quotaAllocationSchema>;
export type Quota = z.infer<typeof quotaSchema>;
