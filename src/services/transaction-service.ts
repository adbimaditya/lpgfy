import type { Page } from '@playwright/test';

import { mapTransactionResponseToTransaction } from '../libs/dto.ts';
import SalePage from '../pages/sale-page.ts';
import { transactionResponseSchema } from '../schemas/transaction-record.ts';
import type { GetTransactionArgs, GetTransactionFromResponseArgs } from '../types/service.ts';

export default class TransactionService {
  private readonly salePage: SalePage;

  constructor(page: Page) {
    this.salePage = new SalePage(page);
  }

  private async getTransactionFromResponse({
    nationalityId,
    customerType,
    orderQuantity,
  }: GetTransactionFromResponseArgs) {
    const response = await this.salePage.waitForTransactionResponse();
    const apiResponse = await response.json();
    const transactionResponse = transactionResponseSchema.parse(apiResponse);
    return mapTransactionResponseToTransaction({
      transactionResponse,
      nationalityId,
      customerType,
      orderQuantity,
    });
  }

  public async getTransaction(args: GetTransactionArgs) {
    return this.getTransactionFromResponse(args);
  }
}
