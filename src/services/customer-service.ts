import type { Page } from '@playwright/test';
import status from 'http-status';

import { mapCustomerResponseToCustomer } from '../libs/dto.ts';
import { getProfileFromFile } from '../libs/file.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import Customer from '../models/customer.ts';
import Household from '../models/household.ts';
import MicroBusiness from '../models/micro-business.ts';
import Retailer from '../models/retailer.ts';
import VerificationPage from '../pages/verification-page.ts';
import { customerResponseSchema } from '../schemas/customer-record.ts';
import type { CustomerScrapperConstructorArgs } from '../types/constructor.ts';
import type { CustomerType } from '../types/model.ts';
import type { GetCustomerScrapperArgs } from '../types/service.ts';

export default class CustomerService {
  private readonly customerClasses = new Map<
    CustomerType,
    new (args: CustomerScrapperConstructorArgs) => CustomerScraper
  >([
    ['Rumah Tangga', Household],
    ['Pengecer', Retailer],
    ['Usaha Mikro', MicroBusiness],
  ]);
  private readonly verificationPage: VerificationPage;

  constructor(page: Page) {
    this.verificationPage = new VerificationPage(page);
  }

  private async getCustomerFromResponse(nationalityId: string): Promise<Customer | null> {
    const response = await this.verificationPage.waitForCustomerResponse({
      nationalityId,
      trigger: () => this.verificationPage.submitNationalityIdVerificationForm(),
    });

    if (!response.ok()) {
      if (response.status() === status.NOT_FOUND) {
        await this.verificationPage.closeCustomerTypeSelectionDialog();
      }

      return null;
    }

    const profile = await getProfileFromFile();
    const apiResponse = await response.json();
    const customerResponse = customerResponseSchema.parse(apiResponse);
    return mapCustomerResponseToCustomer({
      customerResponse: { ...customerResponse, data: { ...customerResponse.data, nationalityId } },
      profile,
    });
  }

  public async getCustomer(nationalityId: string): Promise<Customer | null> {
    await this.verificationPage.fillNationalityIdVerificationInput(nationalityId);
    return this.getCustomerFromResponse(nationalityId);
  }

  public getCustomerScrapper({
    selectedCustomerType,
    customerScrapperConstructorArgs,
  }: GetCustomerScrapperArgs): CustomerScraper {
    const CustomerClass = this.customerClasses.get(selectedCustomerType);
    if (!CustomerClass) {
      throw new Error(`Unknown customer type ${selectedCustomerType}`);
    }

    return new CustomerClass(customerScrapperConstructorArgs);
  }
}
