import Customer from '../models/customer.ts';
import type { Profile, QuotaAllocation } from '../schemas/file.ts';
import type { ProfileResponse } from '../schemas/profile-record.ts';
import type {
  CustomerArgs,
  CustomerResponseToCustomerArgs,
  QuotaRecordToQuotaAllocationArgs,
} from './args.ts';
import type { CustomerType } from './types.ts';

export function profileRecordToProfile({ data }: ProfileResponse): Profile {
  return {
    nationalityId: data.nationalityId,
    registrationId: data.registrationId,
    mid: data.midMap,
    name: data.name,
  };
}

export function customerResponseToCustomer({
  customerResponse: { data },
  profile,
}: CustomerResponseToCustomerArgs): Customer {
  const args: CustomerArgs = {
    nationalityId: data.nationalityId,
    encryptedFamilyId: data.familyIdEncrypted,
    customerTypes: data.customerTypes.map((customerType) => ({
      name: customerType.name as CustomerType,
      mid: customerType.merchant ? customerType.merchant.mid : null,
    })),
    customerFlags: {
      isAgreedTermsConditions: data.isAgreedTermsConditions,
      isCompleted: data.isCompleted,
      isSubsidy: data.isSubsidi,
      isRecommendationLetter: data.isRecommendationLetter,
      isBlocked: data.isBlocked,
      isBusinessType: data.isBusinessType,
      isBusinessName: data.isBusinessName,
    },
    profile,
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
