import z from 'zod';

import { customerTypeName } from './customer-response.ts';

export const customerDTOSchema = z.object({
  nationalityID: z.string(),
  encryptedFamilyID: z.string(),
  types: z.array(customerTypeName),
});

export type CustomerDTO = z.infer<typeof customerDTOSchema>;
