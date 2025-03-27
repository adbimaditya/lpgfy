import { chromium } from '@playwright/test';

import authConfig from './configs/auth.ts';
import LoginPage from './pages/login-page.ts';
import VerificationPage from './pages/verification-page.ts';

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

  const verificationPage = new VerificationPage(page);

  await verificationPage.fillNationalityIdVerificationInput('');
  await verificationPage.submitNationalityIdVerificationForm();

  await page.waitForTimeout(3000);

  await verificationPage.goto();
  await verificationPage.logout();

  await page.close();
  await context.close();
  await browser.close();
}

main();
