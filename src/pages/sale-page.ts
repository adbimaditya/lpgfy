import type { Page } from '@playwright/test';

import { TRANSACTION_ENDPOINT } from '../libs/constants.ts';
import { tryCatch } from '../libs/utils.ts';

export default class SalePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async changeCustomer() {
    await this.page.getByTestId('btnChangeBuyer').click();
  }

  public async increaseOrderQuantity(orderQuantity: number) {
    await this.page.getByTestId('actionIcon2').click({ clickCount: orderQuantity, delay: 100 });
  }

  public async checkOrder() {
    await this.page.getByRole('button', { name: 'Cek Pesanan' }).click();
  }

  public async submitOrderCreationForm() {
    await this.page.getByRole('button', { name: 'Proses Transaksi' }).click();
  }

  public async isFamilyQuotaExceed() {
    const { error } = await tryCatch(
      this.page.waitForSelector(
        'text=Tidak dapat transaksi karena telah melebihi batas kewajaran pembelian LPG 3 kg bulan ini untuk NIK yang terdaftar pada nomor KK yang sama.',
        { state: 'attached', timeout: 500 },
      ),
    );
    return error === null;
  }

  public async isMerchantQuotaExceed() {
    const { error } = await tryCatch(
      this.page.waitForSelector('[data-testid="btnSeeManageProduct"]', {
        state: 'attached',
        timeout: 500,
      }),
    );
    return error === null;
  }

  public async getMerchantQuota() {
    return Number(
      (
        (await this.page
          .locator('form > div:nth-child(2) > div:nth-child(1) > div > p:nth-child(3) > b')
          .textContent()) as string
      ).trim(),
    );
  }

  public async waitForTransactionResponse() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url().startsWith(TRANSACTION_ENDPOINT),
    );

    return responsePromise;
  }
}
