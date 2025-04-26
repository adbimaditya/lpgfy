import LoginPage from '../pages/login-page.ts';
import VerificationPage from '../pages/verification-page.ts';
import OrderService from '../services/order-service.ts';
import ProfileService from '../services/profile-service.ts';
import QuotaService from '../services/quota-service.ts';
import type { LoginArgs } from '../types/lib.ts';
import type { FlaggedNationalityId, FlaggedOrder } from '../types/model.ts';
import { closeBrowser, closeBrowserOnError, createBrowser } from './browser.ts';
import { AUTH_FILE_PATH, PROFILE_FILE_PATH, VERIFICATION_URL } from './constants.ts';
import { deleteFileAsync, readFileAsync, writeFileAsync } from './file.ts';
import { tryCatch } from './utils.ts';

export async function getIsAuthenticated() {
  const { error: readError } = await tryCatch(readFileAsync(AUTH_FILE_PATH));
  if (readError) {
    return false;
  }

  const { browser, page } = await createBrowser({
    browserContextOptions: { storageState: AUTH_FILE_PATH },
  });

  const verificationPage = new VerificationPage(page);

  await verificationPage.goto({ waitUntil: 'networkidle' });
  const currentUrl = page.url();

  await closeBrowser(browser);

  return currentUrl === VERIFICATION_URL;
}

export async function login({ identifier, pin }: LoginArgs) {
  const { browser, page } = await createBrowser();

  const loginPage = new LoginPage(page);
  const verificationPage = new VerificationPage(page);
  const profileService = new ProfileService(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await loginPage.goto({ waitUntil: 'networkidle' });
      await loginPage.fillIdentifierInput(identifier);
      await loginPage.fillPinInput(pin);
      await loginPage.submitLoginForm();

      const profile = await profileService.getProfile();

      await writeFileAsync(PROFILE_FILE_PATH, profile);

      await verificationPage.closeCarousel();
      await verificationPage.saveAuth();

      await closeBrowser(browser);
    },
  });
}

export async function logout() {
  const { browser, page } = await createBrowser({
    browserContextOptions: { storageState: AUTH_FILE_PATH },
  });

  const verificationPage = new VerificationPage(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await verificationPage.goto();
      await verificationPage.logout();
      await deleteFileAsync(AUTH_FILE_PATH);
      await deleteFileAsync(PROFILE_FILE_PATH);

      await closeBrowser(browser);
    },
  });
}

export async function scrapQuotas(flaggedNationalityIds: FlaggedNationalityId[]) {
  const { browser, page } = await createBrowser({
    browserContextOptions: {
      storageState: AUTH_FILE_PATH,
    },
  });

  const verificationPage = new VerificationPage(page);
  const quotaService = new QuotaService(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await verificationPage.goto();

      for (const flaggedNationalityId of flaggedNationalityIds) {
        await quotaService.scrapQuota(flaggedNationalityId);
      }

      await closeBrowser(browser);
    },
  });
}

export async function createOrders(flaggedOrders: FlaggedOrder[]) {
  const { browser, page } = await createBrowser({
    browserContextOptions: {
      storageState: AUTH_FILE_PATH,
    },
  });

  const verificationPage = new VerificationPage(page);
  const orderService = new OrderService(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await verificationPage.goto();

      for (const flaggedOrder of flaggedOrders) {
        await orderService.createOrder(flaggedOrder);
      }

      await closeBrowser(browser);
    },
  });
}
