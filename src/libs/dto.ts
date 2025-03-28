/* eslint-disable import/prefer-default-export */

import type { CustomerArgs, CustomerResponseToCustomerScraperArgs } from './args.ts';
import { createCustomer } from './factories.ts';
import type { CustomerScraper } from './interfaces.ts';
import type { CustomerType } from './types.ts';

export function customerResponseToCustomerScraper({
  page,
  response: { data },
}: CustomerResponseToCustomerScraperArgs): CustomerScraper {
  const args: CustomerArgs = {
    nationalityId: data.nationalityId,
    encryptedFamilyId: data.familyIdEncrypted,
    types: data.customerTypes.map((customerType) => customerType.name as CustomerType),
    flags: {
      isAgreedTermsConditions: data.isAgreedTermsConditions,
      isCompleted: data.isCompleted,
      isSubsidy: data.isSubsidi,
      isRecommendationLetter: data.isRecommendationLetter,
      isBlocked: data.isBlocked,
      isBusinessType: data.isBusinessType,
      isBusinessName: data.isBusinessName,
    },
  };

  const [firstType] = args.types;

  const customer = createCustomer({ page, args, selectedType: firstType });

  return customer;
}
