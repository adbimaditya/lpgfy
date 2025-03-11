/* eslint-disable no-unused-vars */

import Household from '../models/household.ts';
import MicroBusiness from '../models/micro-business.ts';
import Quota from '../models/quota.ts';
import Retailer from '../models/retailer.ts';
import type { CustomerType } from '../schemas/customer.ts';

import type { CreateCustomerArgs, CustomerArgs, QuotaArgs } from './args.ts';
import type { Customer } from './interfaces.ts';

const customerClasses = new Map<CustomerType, new (customerArgs: CustomerArgs) => Customer>([
  ['Rumah Tangga', Household],
  ['Pengecer', Retailer],
  ['Usaha Mikro', MicroBusiness],
]);

export function createCustomer({ args, selectedType }: CreateCustomerArgs): Customer {
  const CustomerClass = customerClasses.get(selectedType);
  if (!CustomerClass) {
    throw new Error(`Unknown customer type ${selectedType}`);
  }

  return new CustomerClass(args);
}

export function createQuota(args: QuotaArgs): Quota {
  return new Quota(args);
}
