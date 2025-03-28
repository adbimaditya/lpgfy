/* eslint-disable no-continue */

import { chromium } from '@playwright/test';
import retry from 'async-retry';

import authConfig from './configs/auth.ts';
import { MY_LUCKY_NUMBER, NATIONALITY_ID_VERIFICATION_DELAY } from './libs/constants.ts';
import {
  ensureFlaggedNationalityIdsFileExists,
  updateFlaggedNationalityIdsFile,
  updateQuotasFile,
} from './libs/utils.ts';
import LoginPage from './pages/login-page.ts';
import NationalityIdVerificationPage from './pages/nationality-id-verification-page.ts';
import SalePage from './pages/sale-page.ts';

async function main() {
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
  await loginPage.saveAuth();
  await loginPage.closeCarousel();

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  const flaggedNationalityIds = await ensureFlaggedNationalityIdsFileExists();

  for (const { nationalityId, flag } of flaggedNationalityIds) {
    if (flag) {
      continue;
    }

    await updateFlaggedNationalityIdsFile(nationalityId);

    const customer = await nationalityIdVerificationPage.getCustomer(nationalityId);

    if (!customer) {
      await page.waitForTimeout(NATIONALITY_ID_VERIFICATION_DELAY);
      continue;
    }

    const quotaRecord = await customer.scrapQuotaRecord();

    if (!quotaRecord) {
      await page.waitForTimeout(NATIONALITY_ID_VERIFICATION_DELAY);
      continue;
    }

    await updateQuotasFile({ nationalityId, ...quotaRecord });

    const salePage = new SalePage(page);

    await salePage.changeCustomer();
    await page.waitForTimeout(NATIONALITY_ID_VERIFICATION_DELAY);
  }

  await nationalityIdVerificationPage.goto();
  await nationalityIdVerificationPage.logout();

  await page.close();
  await context.close();
  await browser.close();
}

retry(main, { retries: MY_LUCKY_NUMBER });
