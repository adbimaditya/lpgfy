import Customer from '../models/customer.ts';
import type { QuotaAllocation } from '../schemas/file.ts';
import type {
  CustomerArgs,
  CustomerResponseToCustomerArgs,
  QuotaRecordToQuotaAllocationArgs,
} from './args.ts';
import type { CustomerType } from './types.ts';

export function customerResponseToCustomer({
  customerResponse: { data },
}: CustomerResponseToCustomerArgs): Customer {
  const args: CustomerArgs = {
    nationalityId: data.nationalityId,
    encryptedFamilyId: data.familyIdEncrypted,
    customerTypes: data.customerTypes.map((customerType) => customerType.name as CustomerType),
    customerFlags: {
      isAgreedTermsConditions: data.isAgreedTermsConditions,
      isCompleted: data.isCompleted,
      isSubsidy: data.isSubsidi,
      isRecommendationLetter: data.isRecommendationLetter,
      isBlocked: data.isBlocked,
      isBusinessType: data.isBusinessType,
      isBusinessName: data.isBusinessName,
    },
  };

  const customer = new Customer(args);

  return customer;
}

export function quotaRecordToQuotaAllocation({
  customerType,
  quotaRecord,
}: QuotaRecordToQuotaAllocationArgs): QuotaAllocation {
  return {
    type: customerType,
    quantity: quotaRecord.quotaRemaining.daily,
  };
}
