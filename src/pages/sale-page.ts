import type { Page } from '@playwright/test';

import { SALE_URL, TRANSACTION_ENDPOINT } from '../libs/constants.ts';
import { transactionResponseToTransaction } from '../libs/dto.ts';
import type { Order } from '../libs/types.ts';
import { transactionResponseSchema } from '../schemas/transaction-record.ts';

export default class SalePage {
  private readonly url: string = SALE_URL;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async waitForOrderURL() {
    await this.page.waitForURL('**/sale?orderPage=true');
  }

  public async waitForStructURL() {
    await this.page.waitForURL('**/sale/struk?transactionId=**');
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

  public async waitForTransaction(order: Order) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url().startsWith(TRANSACTION_ENDPOINT),
    );

    const response = await responsePromise;
    const apiResponse = await response.json();
    const transactionResponse = transactionResponseSchema.parse(apiResponse);
    const transaction = transactionResponseToTransaction({ transactionResponse, order });

    return transaction;
  }
}
