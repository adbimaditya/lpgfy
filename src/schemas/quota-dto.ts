import z from 'zod';

import { customerTypeName } from './customer-response.ts';

export const quotaDTOSchema = z.object({
  nationalityID: z.string(),
  type: customerTypeName,
  quantity: z.number(),
});

export type QuotaDTO = z.infer<typeof quotaDTOSchema>;
