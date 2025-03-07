import z from 'zod';

export const customerSchema = z.object({
  nationalityID: z.string(),
  type: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;
