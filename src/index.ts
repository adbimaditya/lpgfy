import { chromium } from '@playwright/test';
import retry from 'async-retry';

import config from './config/index.ts';
import { LOGIN_URL, MY_LUCKY_NUMBER, VERIFY_NATIONALITY_ID_DELAY } from './libs/constants.ts';
import { closeCarousel, login, logout, scrapQuotas } from './libs/my-pertamina.ts';
import { getUnprocessedFlaggedNationalityIDs } from './libs/utils.ts';

const { phoneNumber, pin } = config;

async function main() {
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

  const unprocessedFlaggedNationalityIDs = await getUnprocessedFlaggedNationalityIDs();
  for (const { nationalityID } of unprocessedFlaggedNationalityIDs) {
    await scrapQuotas({ page, nationalityID });
    await page.waitForTimeout(VERIFY_NATIONALITY_ID_DELAY);
  }

  await logout({ page });

  await page.close();
  await context.close();
  await browser.close();
}

retry(main, { retries: MY_LUCKY_NUMBER });
