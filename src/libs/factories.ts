/* eslint-disable no-unused-vars */

import type { Page } from '@playwright/test';

import Household from '../models/household.ts';
import MicroBusiness from '../models/micro-business.ts';
import Retailer from '../models/retailer.ts';
import type { CreateCustomerArgs, CustomerArgs } from './args.ts';
import type { CustomerScraper } from './interfaces.ts';
import type { CustomerType } from './types.ts';

export const customerClasses = new Map<
  CustomerType,
  new (page: Page, args: CustomerArgs) => CustomerScraper
>([
  ['Rumah Tangga', Household],
  ['Pengecer', Retailer],
  ['Usaha Mikro', MicroBusiness],
]);

export function createCustomer({
  page,
  customerArgs,
  selectedCustomerType,
}: CreateCustomerArgs): CustomerScraper {
  const CustomerClass = customerClasses.get(selectedCustomerType);
  if (!CustomerClass) {
    throw new Error(`Unknown customer type ${selectedCustomerType}`);
  }

  return new CustomerClass(page, customerArgs);
}
