import { chromium } from '@playwright/test';

import authConfig from '../configs/auth.ts';
import Customer from '../models/customer.ts';
import LoginPage from '../pages/login-page.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import SalePage from '../pages/sale-page.ts';
import type {
  ScrapQuotaAllocationArgs,
  ScrapQuotaAllocationsArgs,
  ScrapQuotaArgs,
} from './args.ts';
import { AUTH_FILE_PATH, NATIONALITY_ID_VERIFICATION_URL } from './constants.ts';
import { createCustomer } from './factories.ts';
import {
  deleteFileAsync,
  ensureFlaggedNationalityIdsFileExists,
  isEmpty,
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

export async function login() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    viewport: null,
  });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.goto({ waitUntil: 'networkidle' });
  await loginPage.fillIdentifierInput(authConfig.identifier);
  await loginPage.fillPinInput(authConfig.pin);
  await loginPage.submitLoginForm();
  await loginPage.closeCarousel();
  await loginPage.saveAuth();

  await page.close();
  await context.close();
  await browser.close();
}

export async function logout() {
  const isAuthenticated = await getIsAuthenticated();
  if (!isAuthenticated) {
    return;
  }

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

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await nationalityIdVerificationPage.logout();
  await deleteFileAsync(filePath);

  await page.close();
  await context.close();
  await browser.close();
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

export async function scrapQuotaAllocations({
  page,
  nationalityId,
  customerTypes,
}: ScrapQuotaAllocationsArgs) {
  const quotaAllocations = [];
  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  for (const selectedCustomerType of customerTypes) {
    const customer = (await nationalityIdVerificationPage.getCustomer(nationalityId)) as Customer;

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

  await nationalityIdVerificationPage.goto();
  await nationalityIdVerificationPage.waitForTimeout();

  const quotaAllocations = await scrapQuotaAllocations({
    page,
    nationalityId: customer.getNationalityId(),
    customerTypes: customer.getTypes(),
  });

  if (isEmpty(quotaAllocations)) {
    return;
  }

  await updateQuotasFile({
    nationalityId,
    allocations: quotaAllocations,
  });
}

export async function scrapQuotas() {
  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    return;
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({
    storageState: AUTH_FILE_PATH,
    viewport: null,
  });
  const page = await context.newPage();

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await nationalityIdVerificationPage.goto();

  const flaggedNationalityIds = await ensureFlaggedNationalityIdsFileExists();

  for (const flaggedNationalityId of flaggedNationalityIds) {
    await scrapQuota({ page, flaggedNationalityId });
  }

  await page.close();
  await context.close();
  await browser.close();
}
