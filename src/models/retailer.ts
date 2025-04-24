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

  public hasSimilarRegisterLocation() {
    const types = this.getTypes();
    const baseProfile = this.getBaseProfile();
    const retailer = types.find((type) => type.name === 'Pengecer');

    return Boolean(retailer && retailer.mid === baseProfile.mid);
  }

  private async handleBureaucracy() {
    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    if (this.hasMultipleTypes()) {
      await nationalityIdVerificationPage.selectCustomerType(this.selectionLabel);
      await nationalityIdVerificationPage.continueTransaction();
    }

    if (!this.hasSimilarRegisterLocation()) {
      await nationalityIdVerificationPage.closeRetailerLocationDialog();
      await this.page.reload(); // * Fix strange behavior when waiting for response after this iteration
      return false;
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
      isValid: this.hasValidQuotaForSelectedCustomerType(this.name),
    });
  }
}
