import type { Page } from '@playwright/test';

import type { Customer } from '../libs/interfaces.ts';
import { fetchQuota } from '../libs/my-pertamina.ts';
import type { CustomerType } from '../schemas/customer.ts';

import BaseCustomer from './base-customer.ts';

export default class Household extends BaseCustomer implements Customer {
  private name: CustomerType = 'Rumah Tangga';

  async getQuota(page: Page) {
    this.handleBureaucracy(page);

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
  }
}
