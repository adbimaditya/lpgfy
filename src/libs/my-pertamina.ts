import { chromium } from '@playwright/test';

import LoginPage from '../pages/login-page.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import SalePage from '../pages/sale-page.ts';
import type { FlaggedNationalityId } from '../schemas/file.ts';
import type {
  LoginArgs,
  ScrapQuotaAllocationArgs,
  ScrapQuotaAllocationsArgs,
  ScrapQuotaArgs,
} from './args.ts';
import { AUTH_FILE_PATH, NATIONALITY_ID_VERIFICATION_URL } from './constants.ts';
import { createCustomer } from './factories.ts';
import {
  closeBrowserOnError,
  deleteFileAsync,
  isEmpty,
  isFirstIteration,
  readFileAsync,
  tryCatch,
  updateFlaggedNationalityIdsFile,
  updateQuotasFile,
} from './utils.ts';

export async function getIsAuthenticated() {
  const filePath = AUTH_FILE_PATH;
  const { error } = await tryCatch(readFileAsync(filePath));

  if (error) {
    return false;
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    storageState: filePath,
    viewport: null,
  });
  const page = await context.newPage();

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await nationalityIdVerificationPage.goto({ waitUntil: 'networkidle' });
  const currentUrl = page.url();

  await page.close();
  await context.close();
  await browser.close();

  return currentUrl === NATIONALITY_ID_VERIFICATION_URL;
}

export async function login({ identifier, pin }: LoginArgs) {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    viewport: null,
  });
  const page = await context.newPage();

  await closeBrowserOnError({
    page,
    context,
    browser,
    callback: async () => {
      const loginPage = new LoginPage(page);

      await loginPage.goto({ waitUntil: 'networkidle' });
      await loginPage.fillIdentifierInput(identifier);
      await loginPage.fillPinInput(pin);
      await loginPage.submitLoginForm();
      await loginPage.closeCarousel();
      await loginPage.saveAuth();

      await page.close();
      await context.close();
      await browser.close();
    },
  });
}

export async function logout() {
  const filePath = AUTH_FILE_PATH;

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    storageState: filePath,
    viewport: null,
  });
  const page = await context.newPage();

  await closeBrowserOnError({
    page,
    context,
    browser,
    callback: async () => {
      const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

      await nationalityIdVerificationPage.goto();
      await nationalityIdVerificationPage.logout();
      await deleteFileAsync(filePath);

      await page.close();
      await context.close();
      await browser.close();
    },
  });
}

export async function scrapQuotaAllocation({
  page,
  customer,
  selectedCustomerType,
}: ScrapQuotaAllocationArgs) {
  const customerScraper = createCustomer({
    page,
    customerArgs: {
      nationalityId: customer.getNationalityId(),
      encryptedFamilyId: customer.getEncryptedFamilyId(),
      customerTypes: customer.getTypes(),
      customerFlags: customer.getFlags(),
    },
    selectedCustomerType,
  });

  const quotaAllocation = await customerScraper.scrapQuotaAllocation();

  if (!quotaAllocation) {
    return null;
  }

  const salePage = new SalePage(page);

  await salePage.changeCustomer();

  return quotaAllocation;
}

export async function scrapQuotaAllocations({ page, customer }: ScrapQuotaAllocationsArgs) {
  const quotaAllocations = [];
  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  for (const [index, selectedCustomerType] of customer.getTypes().entries()) {
    if (!isFirstIteration(index)) {
      await nationalityIdVerificationPage.getCustomer(customer.getNationalityId());
    }

    const quotaAllocation = await scrapQuotaAllocation({
      page,
      customer,
      selectedCustomerType,
    });

    if (quotaAllocation) {
      quotaAllocations.push(quotaAllocation);
    }
  }

  await nationalityIdVerificationPage.waitForTimeout();

  return quotaAllocations;
}

export async function scrapQuota({
  page,
  flaggedNationalityId: { nationalityId, flag },
}: ScrapQuotaArgs) {
  if (flag) {
    return;
  }

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  const customer = await nationalityIdVerificationPage.getCustomer(nationalityId);

  await updateFlaggedNationalityIdsFile(nationalityId);

  if (!customer) {
    await nationalityIdVerificationPage.waitForTimeout();
    return;
  }

  const quotaAllocations = await scrapQuotaAllocations({
    page,
    customer,
  });

  if (isEmpty(quotaAllocations)) {
    return;
  }

  await updateQuotasFile({
    nationalityId,
    allocations: quotaAllocations,
  });
}

export async function scrapQuotas(flaggedNationalityIds: FlaggedNationalityId[]) {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    storageState: AUTH_FILE_PATH,
    viewport: null,
  });
  const page = await context.newPage();

  await closeBrowserOnError({
    page,
    context,
    browser,
    callback: async () => {
      const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

      await nationalityIdVerificationPage.goto();

      for (const flaggedNationalityId of flaggedNationalityIds) {
        await scrapQuota({ page, flaggedNationalityId });
      }

      await page.close();
      await context.close();
      await browser.close();
    },
  });
}
