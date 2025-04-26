import type { Page } from '@playwright/test';

import { mapQuotaToOrder } from '../libs/dto.ts';
import { updateFlaggedOrdersFile, updateTransactionsFile } from '../libs/file.ts';
import SalePage from '../pages/sale-page.ts';
import VerificationPage from '../pages/verification-page.ts';
import type { FlaggedOrder, Order, Transaction } from '../types/model.ts';
import type { GenerateFromQuotasArgs, ProcessOrderArgs } from '../types/service.ts';
import CustomerService from './customer-service.ts';
import QuotaService from './quota-service.ts';
import TransactionService from './transaction-service.ts';

export default class OrderService {
  private readonly verificationPage: VerificationPage;
  private readonly salePage: SalePage;
  private readonly customerService: CustomerService;
  private readonly quotaService: QuotaService;
  private readonly transactionService: TransactionService;

  constructor(page: Page) {
    this.verificationPage = new VerificationPage(page);
    this.salePage = new SalePage(page);
    this.customerService = new CustomerService(page);
    this.quotaService = new QuotaService(page);
    this.transactionService = new TransactionService(page);
  }

  private async processOrder({
    nationalityId,
    customerType,
    orderQuantity,
  }: ProcessOrderArgs): Promise<Transaction> {
    await this.salePage.increaseOrderQuantity(orderQuantity);
    await this.salePage.checkOrder();
    await this.salePage.submitOrderCreationForm();
    return this.transactionService.getTransaction({
      nationalityId,
      customerType,
      orderQuantity,
    });
  }

  public async createOrder({ flag, nationalityId, customerType, quantity }: FlaggedOrder) {
    if (flag) {
      await this.verificationPage.waitForTimeout();
      return;
    }

    const customer = await this.customerService.getCustomer(nationalityId);
    await updateFlaggedOrdersFile(nationalityId);
    if (!customer) {
      await this.verificationPage.waitForTimeout();
      return;
    }

    const quota = await this.quotaService.getQuota({
      customer,
      selectedCustomerType: customerType,
    });
    if (!quota) {
      await this.verificationPage.waitForTimeout();
      return;
    }

    const isQuotaValid = await this.quotaService.isQuotaEligible({
      quota,
      orderQuantity: quantity,
    });
    if (!isQuotaValid) {
      await this.verificationPage.goto();
      await this.verificationPage.waitForTimeout();
      return;
    }

    const transaction = await this.processOrder({
      nationalityId,
      customerType,
      orderQuantity: quantity,
    });
    await updateTransactionsFile(transaction);
    await this.verificationPage.goto();
    await this.verificationPage.waitForTimeout();
  }

  public static generateOrdersFromQuotas({
    quotas,
    orderQuantity,
  }: GenerateFromQuotasArgs): Order[] {
    return quotas
      .filter((quota) => quota.quantity > 0 && quota.isValid)
      .map((quota) =>
        mapQuotaToOrder({
          nationalityId: quota.nationalityId,
          customerType: quota.customerType,
          quotaQuantity: quota.quantity,
          orderQuantity,
        }),
      );
  }
}
