import type { Page } from '@playwright/test';

import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import type { CustomerType } from '../libs/types.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import Customer from './customer.ts';

export default class MicroBusiness extends Customer implements CustomerScraper {
  private readonly name: CustomerType = 'Usaha Mikro';
  private readonly page: Page;

  constructor(page: Page, args: CustomerArgs) {
    super(args);

    this.page = page;
  }

  public async scrapQuotaRecord() {
    await this.handleBureaucracy();

    const nationalityIdVerificationPage = new NationalityIdVerificationPage(this.page);

    return nationalityIdVerificationPage.getQuotaRecord({
      nationalityId: this.getNationalityId(),
      encryptedFamilyId: this.getEncryptedFamilyId(),
      customerType: this.name,
    });
  }

  private async handleBureaucracy() {
    if (this.hasMultipleTypes()) {
      await this.page.getByRole('dialog').getByTestId(`radio-${this.name}`).check();
      await this.page.getByRole('dialog').getByRole('button', { name: 'Lanjut Transaksi' }).click();
    }

    if (!this.isEligible()) {
      await this.page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();
      return;
    }

    if (!this.hasRecommendationLetter()) {
      await this.page.getByRole('button', { name: 'Lewati, Lanjut Transaksi' }).click();
    }
  }

  private isEligible(): boolean {
    const flags = this.getFlags();

    return flags.isBusinessType && flags.isBusinessName;
  }

  private hasRecommendationLetter() {
    const flags = this.getFlags();

    return flags.isRecommendationLetter;
  }
}
