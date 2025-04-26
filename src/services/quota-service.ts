import type { Page } from '@playwright/test';

import { mapQuotaResponseToQuota } from '../libs/dto.ts';
import { updateFlaggedNationalityIdsFile, updateQuotasFile } from '../libs/file.ts';
import { isFirstIteration } from '../libs/utils.ts';
import SalePage from '../pages/sale-page.ts';
import VerificationPage from '../pages/verification-page.ts';
import { quotaResponseSchema } from '../schemas/quota-record.ts';
import type { FlaggedNationalityId } from '../types/model.ts';
import type {
  GetQuotaArgs,
  GetQuotaFromResponseArgs,
  IsQuotaEligibleArgs,
} from '../types/service.ts';
import CustomerService from './customer-service.ts';

export default class QuotaService {
  private readonly page: Page;
  private readonly verificationPage: VerificationPage;
  private readonly salePage: SalePage;
  private readonly customerService: CustomerService;

  constructor(page: Page) {
    this.page = page;
    this.verificationPage = new VerificationPage(page);
    this.salePage = new SalePage(page);
    this.customerService = new CustomerService(page);
  }

  private getPage(): Page {
    return this.page;
  }

  private async getQuotaFromResponse({
    nationalityId,
    encryptedFamilyId,
    selectedCustomerType,
    isValid,
  }: GetQuotaFromResponseArgs) {
    const response = await this.verificationPage.waitForQuotaResponse({
      nationalityId,
      encryptedFamilyId,
      selectedCustomerType,
    });
    const apiResponse = await response.json();
    const quotaResponse = quotaResponseSchema.parse(apiResponse);
    return mapQuotaResponseToQuota({
      quotaResponse,
      nationalityId,
      customerType: selectedCustomerType,
      isValid,
    });
  }

  public async getQuota({
    customer,
    selectedCustomerType,
    options: { redirect } = { redirect: false },
  }: GetQuotaArgs) {
    const customerScraper = this.customerService.getCustomerScrapper({
      selectedCustomerType,
      customerScrapperConstructorArgs: {
        page: this.getPage(),
        nationalityId: customer.getNationalityId(),
        encryptedFamilyId: customer.getEncryptedFamilyId(),
        customerTypes: customer.getTypes(),
        customerFlags: customer.getFlags(),
        profile: customer.getBaseProfile(),
      },
    });

    const isPass = await customerScraper.handleBureaucracy();
    if (!isPass) return null;

    const quota = this.getQuotaFromResponse({
      nationalityId: customer.getNationalityId(),
      encryptedFamilyId: customer.getEncryptedFamilyId(),
      selectedCustomerType,
      isValid: customer.hasValidQuotaForSelectedCustomerType(selectedCustomerType),
    });

    if (redirect) {
      await this.salePage.changeCustomer();
    }

    return quota;
  }

  public async isQuotaEligible({ quota, orderQuantity }: IsQuotaEligibleArgs): Promise<boolean> {
    return (
      !(await this.salePage.isFamilyQuotaExceed()) &&
      !(await this.salePage.isMerchantQuotaExceed()) &&
      orderQuantity <= (await this.salePage.getMerchantQuota()) &&
      orderQuantity <= quota.quantity &&
      orderQuantity <= 5
    );
  }

  public async scrapQuota({ flag, nationalityId }: FlaggedNationalityId) {
    if (flag) {
      await this.verificationPage.waitForTimeout();
      return;
    }

    const customer = await this.customerService.getCustomer(nationalityId);
    await updateFlaggedNationalityIdsFile(nationalityId);
    if (!customer) {
      await this.verificationPage.waitForTimeout();
      return;
    }

    for (const [index, selectedCustomerType] of customer.getTypeNames().entries()) {
      if (!isFirstIteration(index)) {
        await this.customerService.getCustomer(nationalityId);
      }

      const quota = await this.getQuota({
        customer,
        selectedCustomerType,
        options: { redirect: true },
      });
      if (!quota) {
        await this.verificationPage.waitForTimeout();
        return;
      }

      await updateQuotasFile(quota);
      await this.verificationPage.waitForTimeout();
    }
  }
}
