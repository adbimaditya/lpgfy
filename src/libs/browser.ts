import { type BrowserContextOptions, chromium, type LaunchOptions } from '@playwright/test';

import type { CloseBrowserArgs, CloseBrowserOnErrorArgs, CreateBrowserArgs } from './args.ts';
import { playwrightLogger } from './logger.ts';
import { tryCatch } from './utils.ts';

export async function createBrowser({
  launchOptions = {},
  browserContextOptions = {},
}: CreateBrowserArgs = {}) {
  const defaultLaunchOptions: LaunchOptions = {
    headless: false,
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

export async function closeBrowser({ browser }: CloseBrowserArgs) {
  const contexts = browser.contexts();

  for (const context of contexts) {
    const pages = context.pages();

    for (const page of pages) {
      await page.close();
    }

    await context.close();
  }

  await browser.close();
}

export async function closeBrowserOnError({ browser, callback }: CloseBrowserOnErrorArgs) {
  const { error } = await tryCatch(callback());

  if (error) {
    await closeBrowser({ browser });
  }
}
