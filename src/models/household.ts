import type { Page } from '@playwright/test';

import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import type { CustomerType } from '../libs/types.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import Customer from './customer.ts';

export default class Household extends Customer implements CustomerScraper {
  private readonly name: CustomerType = 'Rumah Tangga';
  private readonly selectionLabel: CustomerType = 'Rumah Tangga';
  private readonly page: Page;

  constructor(page: Page, args: CustomerArgs) {
    super(args);

    this.page = page;
  }

  private async handleBureaucracy() {
    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    if (this.hasMultipleTypes()) {
      await nationalityIdVerificationPage.selectCustomerType(this.selectionLabel);
      await nationalityIdVerificationPage.continueTransaction();
    }

    return true;
  }

  public async scrapQuotaAllocation() {
    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    const isPass = await this.handleBureaucracy();

    if (!isPass) {
      return null;
    }

    return nationalityIdVerificationPage.waitForQuotaAllocation({
      nationalityId: this.getNationalityId(),
      encryptedFamilyId: this.getEncryptedFamilyId(),
      selectedCustomerType: this.name,
    });
  }
}
