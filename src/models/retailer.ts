import type { Page } from '@playwright/test';

import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import type { CustomerType } from '../libs/types.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import Customer from './customer.ts';

export default class Retailer extends Customer implements CustomerScraper {
  private readonly name: CustomerType = 'Pengecer';
  private readonly selectionLabel: string = 'Sub Pangkalan';
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

      if (!this.hasSimilarRegisterLocation()) {
        await nationalityIdVerificationPage.closeRetailerLocationDialog();
        return false;
      }
    }

    return true;
  }

  public async scrapQuotaAllocation() {
    const isPass = await this.handleBureaucracy();

    if (!isPass) {
      return null;
    }

    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    return nationalityIdVerificationPage.getQuotaAllocation({
      nationalityId: this.getNationalityId(),
      encryptedFamilyId: this.getEncryptedFamilyId(),
      selectedCustomerType: this.name,
    });
  }
}
