import type { CustomerDTO, CustomerResponse } from '../schemas/customer.ts';
import type { QuotaDTO } from '../schemas/quota.ts';

import type { ResponseToQuotaDTOArgs } from './args.ts';

export function responseToCustomerDTO(response: CustomerResponse): CustomerDTO {
  return {
    nationalityID: response.data.nationalityId,
    encryptedFamilyID: response.data.familyIdEncrypted,
    types: response.data.customerTypes.map((type) => type.name),
    flags: {
      isAgreedTermsConditions: response.data.isAgreedTermsConditions,
      isCompleted: response.data.isCompleted,
      isSubsidi: response.data.isSubsidi,
      isRecommendationLetter: response.data.isRecommendationLetter,
      isBlocked: response.data.isBlocked,
      isBusinessType: response.data.isBusinessType,
      isBusinessName: response.data.isBusinessName,
    },
  };
}

export function responseToQuotaDTO({
  response,
  nationalityID,
  type,
}: ResponseToQuotaDTOArgs): QuotaDTO {
  return {
    nationalityID,
    type,
    quantity: response.data.quotaRemaining.daily,
  };
}
