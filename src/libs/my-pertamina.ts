import LoginPage from '../pages/login-page.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import SalePage from '../pages/sale-page.ts';
import type { FlaggedNationalityId } from '../schemas/file.ts';
import type {
  LoginArgs,
  ScrapQuotaAllocationArgs,
  ScrapQuotaAllocationsArgs,
  ScrapQuotaArgs,
} from './args.ts';
import { AUTH_FILE_PATH, NATIONALITY_ID_VERIFICATION_URL, PROFILE_FILE_PATH } from './constants.ts';
import { createCustomer } from './factories.ts';
import {
  closeBrowser,
  closeBrowserOnError,
  createBrowser,
  deleteFileAsync,
  isEmpty,
  isFirstIteration,
  readFileAsync,
  tryCatch,
  updateFlaggedNationalityIdsFile,
  updateQuotasFile,
  writeFileAsync,
} from './utils.ts';

export async function getIsAuthenticated() {
  const { error } = await tryCatch(readFileAsync(AUTH_FILE_PATH));

  if (error) {
    return false;
  }

  const { browser, page } = await createBrowser({
    browserContextOptions: { storageState: AUTH_FILE_PATH },
  });

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await nationalityIdVerificationPage.goto({ waitUntil: 'networkidle' });
  const currentUrl = page.url();

  await closeBrowser({ browser });

  return currentUrl === NATIONALITY_ID_VERIFICATION_URL;
}

export async function login({ identifier, pin }: LoginArgs) {
  const { browser, page } = await createBrowser();

  await closeBrowserOnError({
    browser,
    callback: async () => {
      const loginPage = new LoginPage(page);

      await loginPage.goto({ waitUntil: 'networkidle' });
      await loginPage.fillIdentifierInput(identifier);
      await loginPage.fillPinInput(pin);
      await loginPage.submitLoginForm();

      const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

      const profile = await nationalityIdVerificationPage.getProfile();

      await writeFileAsync(PROFILE_FILE_PATH, profile);

      await loginPage.closeCarousel();
      await loginPage.saveAuth();

      await closeBrowser({ browser });
    },
  });
}

export async function logout() {
  const { browser, page } = await createBrowser({
    browserContextOptions: { storageState: AUTH_FILE_PATH },
  });

  await closeBrowserOnError({
    browser,
    callback: async () => {
      const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

      await nationalityIdVerificationPage.goto();
      await nationalityIdVerificationPage.logout();
      await deleteFileAsync(AUTH_FILE_PATH);
      await deleteFileAsync(PROFILE_FILE_PATH);

      await closeBrowser({ browser });
    },
  });
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
      profile: customer.getBaseProfile(),
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

export async function scrapQuotaAllocations({ page, customer }: ScrapQuotaAllocationsArgs) {
  const quotaAllocations = [];
  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  for (const [index, selectedCustomerType] of customer.getTypeNames().entries()) {
    if (!isFirstIteration(index)) {
      await nationalityIdVerificationPage.fillNationalityIdVerificationInput(
        customer.getNationalityId(),
      );
      await nationalityIdVerificationPage.submitNationalityIdVerificationForm();
    }

    const quotaAllocation = await scrapQuotaAllocation({
      page,
      customer,
      selectedCustomerType,
    });

    if (quotaAllocation) {
      quotaAllocations.push(quotaAllocation);
    }

    await nationalityIdVerificationPage.waitForTimeout();
  }

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

  const quotaAllocations = await scrapQuotaAllocations({
    page,
    customer,
  });

  if (isEmpty(quotaAllocations)) {
    return;
  }

  await updateQuotasFile({
    nationalityId,
    allocations: quotaAllocations,
  });
}

export async function scrapQuotas(flaggedNationalityIds: FlaggedNationalityId[]) {
  const { browser, page } = await createBrowser({
    browserContextOptions: {
      storageState: AUTH_FILE_PATH,
    },
  });

  await closeBrowserOnError({
    browser,
    callback: async () => {
      const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

      await nationalityIdVerificationPage.goto();

      for (const flaggedNationalityId of flaggedNationalityIds) {
        await scrapQuota({ page, flaggedNationalityId });
      }

      await closeBrowser({ browser });
    },
  });
}
