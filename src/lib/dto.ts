import type { CustomerResponse } from '../schemas/customer-response.ts';
import type { Customer } from '../schemas/customer.ts';
import type { QuotaResponse } from '../schemas/quota-response.ts';
import type { Quota } from '../schemas/quota.ts';

export function responseToCustomerDTO(response: CustomerResponse, nationalityID: string): Customer {
  const [customerType] = response.data.customerTypes;

  return {
    nationalityID,
    type: customerType.name,
  };
}

export function responseToQuotaDTO(response: QuotaResponse, customer: Customer): Quota {
  return {
    ...customer,
    quantity: response.data.quotaRemaining.daily,
  };
}
