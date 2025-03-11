import Quota from '../models/quota.ts';
import type { CustomerType } from '../schemas/customer.ts';
import type { QuotaDTO } from '../schemas/quota.ts';

export function encodeCustomerType(type: CustomerType) {
  return type.replace(' ', '+');
}

export function getUniqueQuotasDTO(quotas: Quota[]): QuotaDTO[] {
  return quotas
    .filter(
      (quota, index, self) =>
        self.findIndex((q) => q.getNationalityID() === quota.getNationalityID()) === index,
    )
    .map((quota) => quota.toDTO());
}
