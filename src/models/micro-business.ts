import type { Page } from '@playwright/test';

import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import type { CustomerType } from '../libs/types.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import Customer from './customer.ts';

export default class MicroBusiness extends Customer implements CustomerScraper {
  private readonly name: CustomerType = 'Usaha Mikro';
  private readonly selectionLabel: string = 'Usaha Mikro';
  private readonly page: Page;

  constructor(page: Page, args: CustomerArgs) {
    super(args);

    this.page = page;
  }

  private isEligible(): boolean {
    const flags = this.getFlags();

    return flags.isBusinessType && flags.isBusinessName;
  }

  private hasRecommendationLetter() {
    const flags = this.getFlags();

    return flags.isRecommendationLetter;
  }

  private async handleBureaucracy() {
    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    if (this.hasMultipleTypes()) {
      await nationalityIdVerificationPage.selectCustomerType(this.selectionLabel);
      await nationalityIdVerificationPage.continueTransaction();
    }

    if (!this.isEligible() && !this.hasRecommendationLetter()) {
      await nationalityIdVerificationPage.closeUpdateMicroBusinessDataDialog();
      return false;
    }

    if (!this.hasRecommendationLetter()) {
      await nationalityIdVerificationPage.continueTransactionForDelayedUpdate();
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
