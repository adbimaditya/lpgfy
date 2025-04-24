import z from 'zod';

import { customerTypeSchema, nationalityIdSchema } from './customer-record.ts';

export const nationalityIdsSchema = z.array(nationalityIdSchema);
export const flaggedNationalityIdSchema = z.object({
  nationalityId: nationalityIdSchema,
  flag: z.boolean(),
});
export const flaggedNationalityIdsSchema = z.array(flaggedNationalityIdSchema);

export const profileSchema = z.object({
  nationalityId: nationalityIdSchema,
  registrationId: z.string(),
  mid: z.string().nullable(),
  name: z.string(),
});

export const quotaAllocationSchema = z.object({
  customerType: customerTypeSchema,
  quantity: z.number(),
  isValid: z.boolean(),
});
export const quotaSchema = z.object({
  nationalityId: nationalityIdSchema,
  allocations: z.array(quotaAllocationSchema),
});
export const quotasSchema = z.array(quotaSchema);

export const orderSchema = z.object({
  nationalityId: nationalityIdSchema,
  customerType: customerTypeSchema,
  quantity: z.number(),
});
export const ordersSchema = z.array(orderSchema);
export const flaggedOrderSchema = orderSchema.extend({ flag: z.boolean() });
export const flaggedOrdersSchema = z.array(flaggedOrderSchema);

export const transactionSchema = z.object({
  id: z.string(),
  order: orderSchema,
  allocation: quotaAllocationSchema.pick({ customerType: true, quantity: true }),
});
export const transactionsSchema = z.array(transactionSchema);
