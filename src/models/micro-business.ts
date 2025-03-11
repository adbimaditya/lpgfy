import type { Page } from '@playwright/test';

import type { ICustomerType } from '../libs/interfaces.ts';
import { fetchQuota } from '../libs/my-pertamina.ts';
import type { CustomerType } from '../schemas/customer.ts';

import Customer from './customer.ts';
import Quota from './quota.ts';

export default class MicroBusiness extends Customer implements ICustomerType {
  private name: CustomerType = 'Usaha Mikro';

  public async getQuota(page: Page): Promise<Quota | null> {
    await this.handleBureaucracy(page);

    if (!this.isEligible()) {
      return null;
    }

    return fetchQuota({
      page,
      nationalityID: this.getNationalityID(),
      encryptedFamilyID: this.getEncryptedFamilyID(),
      type: this.name,
    });
  }

  private async handleBureaucracy(page: Page) {
    if (this.hasMultipleTypes()) {
      await page.getByRole('dialog').getByTestId(`radio-${this.name}`).check();
      await page.getByRole('dialog').getByRole('button', { name: 'Lanjut Transaksi' }).click();
    }

    if (!this.isEligible()) {
      await page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();
      return;
    }

    if (!this.hasRecommendationLetter()) {
      await page.getByRole('button', { name: 'Lewati, Lanjut Transaksi' }).click();
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
