import {
  type Browser,
  type BrowserContextOptions,
  chromium,
  type LaunchOptions,
} from '@playwright/test';

import type { CloseBrowserOnErrorArgs, CreateBrowserArgs } from '../types/lib.ts';
import { playwrightLogger } from './logger.ts';
import { tryCatch } from './utils.ts';

export async function createBrowser({
  launchOptions = {},
  browserContextOptions = {},
}: CreateBrowserArgs = {}) {
  const defaultLaunchOptions: LaunchOptions = {
    headless: true,
    args: ['--start-maximized'],
    logger: playwrightLogger,
    ...launchOptions,
  };

  const defaultBrowserContextOptions: BrowserContextOptions = {
    viewport: null,
    ...browserContextOptions,
  };

  const browser = await chromium.launch(defaultLaunchOptions);
  const context = await browser.newContext(defaultBrowserContextOptions);
  const page = await context.newPage();

  return { browser, context, page };
}

export async function closeBrowser(browser: Browser) {
  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      await page.close();
    }

    await context.close();
  }

  await browser.close();
}

export async function closeBrowserOnError({ browser, callback }: CloseBrowserOnErrorArgs) {
  const { error } = await tryCatch(callback());
  if (error) {
    await closeBrowser(browser);
  }
}
