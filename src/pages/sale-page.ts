import type { Page } from '@playwright/test';

import { SALE_URL } from '../libs/constants.ts';

export default class SalePage {
  private readonly url: string = SALE_URL;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async changeCustomer() {
    await this.page.getByTestId('btnChangeBuyer').click();
  }
}
