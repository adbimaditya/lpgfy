import type { CustomerType } from '../schemas/customer-response.ts';

export function encodeCustomerType(type: CustomerType) {
  return type.replace(' ', '+');
}
