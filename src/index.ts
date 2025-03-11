import { chromium } from '@playwright/test';

import config from './config/index.ts';
import { LOGIN_URL, VERIFY_NATIONALITY_ID_DELAY } from './libs/constants.ts';
import { readFileAsync } from './libs/file.ts';
import { closeCarousel, login, logout, scrapQuota } from './libs/my-pertamina.ts';
import { nationalityIDsSchema } from './schemas/customer.ts';

const { phoneNumber, pin } = config;

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
  });

  const page = await context.newPage();

  await page.goto(LOGIN_URL, {
    waitUntil: 'networkidle',
  });

  await login({ page, phoneNumber, pin });
  await closeCarousel({ page });

  const nationalityIDsJSON = await readFileAsync('public/data/nationality-ids.json');
  const nationalityIDs = nationalityIDsSchema.parse(nationalityIDsJSON);

  for (const nationalityID of nationalityIDs) {
    await scrapQuota({ page, nationalityID });
    await page.waitForTimeout(VERIFY_NATIONALITY_ID_DELAY);
  }

  await logout({ page });

  await page.close();
  await context.close();
  await browser.close();
})();
