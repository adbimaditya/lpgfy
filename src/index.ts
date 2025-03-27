import { chromium } from '@playwright/test';
import retry from 'async-retry';
import path from 'path';

import authConfig from './configs/auth.ts';
import { MY_LUCKY_NUMBER } from './libs/constants.ts';
import { writeFileAsync } from './libs/utils.ts';
import LoginPage from './pages/login-page.ts';
import NationalityIdVerificationPage from './pages/nationality-id-verification-page.ts';

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

  const nationalityId = '';

  const customerRecord = await nationalityIdVerificationPage.getCustomerRecord(nationalityId);

  if (customerRecord) {
    const { familyIdEncrypted, customerTypes } = customerRecord;
    const [customerType] = customerTypes;

    const quotaRecord = await nationalityIdVerificationPage.getQuotaRecord({
      nationalityId,
      encryptedFamilyId: familyIdEncrypted,
      customerType: customerType.name,
    });

    await writeFileAsync(path.resolve('public', 'data', `${nationalityId}.json`), {
      customerRecord,
      quotaRecord,
    });
  }

  await nationalityIdVerificationPage.goto();
  await nationalityIdVerificationPage.logout();

  await page.close();
  await context.close();
  await browser.close();
}

retry(main, { retries: MY_LUCKY_NUMBER });
