import { z } from 'zod';

import { PAYMENT_TYPES, PRODUCT_TYPES, STATUS } from '../libs/constants.ts';
import {
  channelInjectSchema,
  customerTypeSchema,
  familyIdEncryptedSchema,
  sourceTypeIdSchema,
} from './customer-record.ts';
import { createResponseSchema } from './response.ts';

export const paymentTypeSchema = z.enum(PAYMENT_TYPES);
export const productTypeSchema = z.enum(PRODUCT_TYPES);
export const statusSchema = z.enum(STATUS);

export const transactionRecordSchema = z.object({
  transactionId: z.string(),
  receipt: z.object({
    storeName: z.string(),
    address: z.string(),
    phoneNumber: z.string(),
    image: z.string(),
    note: z.string(),
  }),
  subHeader: z.object({
    merchantName: z.string(),
    transactionUniqueKey: z.string(),
    date: z.string(),
    createAt: z.number(),
  }),
  totalSection: z.object({
    totalPrice: z.string(),
    change: z.string(),
  }),
  customer: z.object({
    customerName: z.string(),
    customerAddress: z.string(),
    customerPhoneNum: z.string(),
  }),
  paymentType: paymentTypeSchema,
  isPaidOff: z.boolean(),
  products: z.array(
    z.object({
      productName: productTypeSchema,
      quantity: z.string(),
      totalPrice: z.string(),
      rawValue: z.object({
        quantity: z.number(),
        price: z.number(),
        totalPrice: z.number(),
      }),
      isSubsidi: z.boolean(),
      subsidiDiscount: z.number(),
    }),
  ),
  status: statusSchema,
  subsidiDiscount: z.number(),
  subsidi: z.object({
    nik: z.string(),
    familyIdEncrypted: familyIdEncryptedSchema,
    category: customerTypeSchema,
    sourceTypeId: sourceTypeIdSchema,
    nama: z.string(),
    channelInject: channelInjectSchema,
    familyId: z.string(),
  }),
  isCanceled: z.boolean(),
  quotaRemaining: z.number().optional(),
});

export const transactionResponseSchema = createResponseSchema(transactionRecordSchema);
