import Customer from '../models/customer.ts';
import type {
  CustomerArgs,
  CustomerResponseToCustomerArgs,
  QuotaResponseToQuotaAllocationArgs,
  TransactionResponseToTransactionArgs,
} from './args.ts';
import type {
  CustomerType,
  Profile,
  ProfileResponse,
  QuotaAllocation,
  Transaction,
} from './types.ts';

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
  const customerArgs: CustomerArgs = {
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

  const customer = new Customer(customerArgs);

  return customer;
}

export function quotaResponseToQuotaAllocation({
  quotaResponse: { data },
  customerType,
}: QuotaResponseToQuotaAllocationArgs): QuotaAllocation {
  return {
    customerType,
    quantity: data.quotaRemaining.daily,
  };
}

export function transactionResponseToTransaction({
  transactionResponse: { data },
  order,
}: TransactionResponseToTransactionArgs): Transaction {
  return {
    id: data.transactionId,
    order,
    allocation: {
      customerType: order.customerType,
      quantity: data.quotaRemaining ?? 0,
    },
  };
}
