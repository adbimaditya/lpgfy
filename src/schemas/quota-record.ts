import { z } from 'zod';

import { createResponseSchema } from './response.ts';

export const quotaRecordSchema = z.object({
  quotaRemaining: z.object({
    daily: z.number(),
    monthly: z.number(),
    family: z.number().optional(),
    all: z.number(),
  }),
});

export const quotaResponseSchema = createResponseSchema(quotaRecordSchema);

export type QuotaRecord = z.infer<typeof quotaRecordSchema>;
export type QuotaResponse = z.infer<typeof quotaResponseSchema>;
