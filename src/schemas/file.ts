import z from 'zod';

import { NATIONALITY_ID_LENGTH } from '../libs/constants.ts';
import { quotaRecordSchema } from './quota-record.ts';

export const nationalityIdSchema = z.string().length(NATIONALITY_ID_LENGTH);
export const nationalityIdsSchema = z.array(nationalityIdSchema);
export const flaggedNationalityIdsSchema = z.array(
  z.object({ nationalityId: nationalityIdSchema, flag: z.boolean() }),
);

export const quotaSchema = z
  .object({
    nationalityId: nationalityIdSchema,
  })
  .merge(quotaRecordSchema);
export const quotasSchema = z.array(quotaSchema);

export type Quota = z.infer<typeof quotaSchema>;
