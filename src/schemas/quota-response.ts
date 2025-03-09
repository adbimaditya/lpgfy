import { z } from 'zod';

import { createResponseSchema } from './response.ts';

export const customerQuotaData = z.object({
  quotaRemaining: z.object({
    daily: z.number(),
    monthly: z.number(),
    all: z.number(),
    family: z.number(),
  }),
});

export const quotaResponseSchema = createResponseSchema(customerQuotaData);

export type QuotaResponse = z.infer<typeof quotaResponseSchema>;
