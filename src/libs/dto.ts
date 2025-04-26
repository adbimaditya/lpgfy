import Customer from '../models/customer.ts';
import type { CustomerConstructorArgs } from '../types/constructor.ts';
import type {
  MapCustomerResponseToCustomerArgs,
  MapQuotaResponseToQuotaArgs,
  MapQuotaToOrderArgs,
  MapTransactionResponseToTransactionArgs,
} from '../types/lib.ts';
import type {
  CustomerType,
  Order,
  Profile,
  ProfileResponse,
  Quota,
  Transaction,
} from '../types/model.ts';

export function mapProfileRecordToProfile({ data }: ProfileResponse): Profile {
  return {
    nationalityId: data.nationalityId,
    registrationId: data.registrationId,
    mid: data.midMap,
    name: data.name,
  };
}

export function mapCustomerResponseToCustomer({
  customerResponse: { data },
  profile,
}: MapCustomerResponseToCustomerArgs): Customer {
  const args: CustomerConstructorArgs = {
    nationalityId: data.nationalityId,
    encryptedFamilyId: data.familyIdEncrypted,
    customerTypes: data.customerTypes.map((customerType) => ({
      name: customerType.name as CustomerType,
      mid: customerType.merchant ? customerType.merchant.mid : null,
      isQuotaValid: customerType.isQuotaValid,
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

  return new Customer(args);
}

export function mapQuotaResponseToQuota({
  quotaResponse: { data },
  nationalityId,
  customerType,
  isValid,
}: MapQuotaResponseToQuotaArgs): Quota {
  return {
    nationalityId,
    customerType,
    quantity: data.quotaRemaining.daily,
    isValid,
  };
}

export function mapTransactionResponseToTransaction({
  transactionResponse: { data },
  nationalityId,
  customerType,
  orderQuantity,
}: MapTransactionResponseToTransactionArgs): Transaction {
  return {
    id: data.transactionId,
    nationalityId,
    customerType,
    order: {
      quantity: orderQuantity,
    },
    quota: {
      quantity: data.quotaRemaining ?? 0,
    },
  };
}

export function mapQuotaToOrder({
  nationalityId,
  customerType,
  quotaQuantity,
  orderQuantity,
}: MapQuotaToOrderArgs): Order {
  return {
    nationalityId,
    customerType,
    quantity: Math.min(quotaQuantity, orderQuantity),
  };
}
