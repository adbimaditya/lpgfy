import { z } from 'zod';

import { customerTypeNameSchema, nationalityIDSchema } from './customer.ts';
import { createResponseSchema } from './response.ts';

export const quotaDTOSchema = z.object({
  nationalityID: nationalityIDSchema,
  type: customerTypeNameSchema,
  quantity: z.number(),
});

export const quotasDTOSchema = z.array(quotaDTOSchema);

export const customerQuotaData = z.object({
  quotaRemaining: z.object({
    daily: z.number(),
    monthly: z.number(),
    family: z.number().optional(),
    all: z.number(),
  }),
});

export const quotaResponseSchema = createResponseSchema(customerQuotaData);

export type QuotaDTO = z.infer<typeof quotaDTOSchema>;
export type QuotaResponse = z.infer<typeof quotaResponseSchema>;
