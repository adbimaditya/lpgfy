import { chromium } from '@playwright/test';

import config from './config/index.ts';
import { writeFileAsync } from './libs/file.ts';
import {
  closeCarousel,
  fetchQuota,
  login,
  logout,
  verifyNationalityID,
} from './libs/my-pertamina.ts';

const { phoneNumber, pin, nationalityID } = config;

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
  });

  const page = await context.newPage();

  await page.goto('https://subsiditepatlpg.mypertamina.id/merchant/auth/login', {
    waitUntil: 'networkidle',
  });

  await login(page, { phoneNumber, pin });
  await closeCarousel(page);

  const customer = await verifyNationalityID(page, nationalityID);
  if (!customer) {
    await page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();
  } else {
    const quota = await fetchQuota(page, customer);

    await writeFileAsync(`public/data/${nationalityID}-quota.json`, quota);
    await page.getByTestId('btnChangeBuyer').click();
  }

  await logout(page);

  await page.close();
  await context.close();
  await browser.close();
})();
