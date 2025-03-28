import type { Page } from '@playwright/test';

import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerScraper } from '../libs/interfaces.ts';
import type { CustomerType } from '../libs/types.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import Customer from './customer.ts';

export default class Household extends Customer implements CustomerScraper {
  private readonly name: CustomerType = 'Rumah Tangga';
  private readonly page: Page;

  constructor(page: Page, args: CustomerArgs) {
    super(args);

    this.page = page;
  }

  public async scrapQuotaRecord() {
    const isPass = await this.handleBureaucracy();

    if (!isPass) {
      return null;
    }

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

    return true;
  }
}
