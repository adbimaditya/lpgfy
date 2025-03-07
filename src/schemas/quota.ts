import z from 'zod';

import { customerSchema } from './customer.ts';

export const quotaSchema = customerSchema.extend({
  quantity: z.number(),
});

export type Quota = z.infer<typeof quotaSchema>;
