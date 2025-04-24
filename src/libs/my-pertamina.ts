import LoginPage from '../pages/login-page.ts';
import NationalityIdVerificationPage from '../pages/nationality-id-verification-page.ts';
import SalePage from '../pages/sale-page.ts';
import type {
  CreateOrderArgs,
  GenerateOrdersFromQuotasArgs,
  LoginArgs,
  ScrapQuotaAllocationArgs,
  ScrapQuotaAllocationsArgs,
  ScrapQuotaArgs,
} from './args.ts';
import { closeBrowser, closeBrowserOnError, createBrowser } from './browser.ts';
import { AUTH_FILE_PATH, NATIONALITY_ID_VERIFICATION_URL, PROFILE_FILE_PATH } from './constants.ts';
import { createCustomer } from './factories.ts';
import {
  deleteFileAsync,
  readFileAsync,
  updateFlaggedNationalityIdsFile,
  updateFlaggedOrdersFile,
  updateQuotasFile,
  updateTransactionsFile,
  writeFileAsync,
} from './file.ts';
import type { FlaggedNationalityId, FlaggedOrder, Order } from './types.ts';
import { isEmpty, isFirstIteration, tryCatch } from './utils.ts';

export async function getIsAuthenticated() {
  const { error: readError } = await tryCatch(readFileAsync(AUTH_FILE_PATH));

  if (readError) {
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

  const loginPage = new LoginPage(page);
  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await loginPage.goto({ waitUntil: 'networkidle' });
      await loginPage.fillIdentifierInput(identifier);
      await loginPage.fillPinInput(pin);
      await loginPage.submitLoginForm();

      const profile = await nationalityIdVerificationPage.waitForProfile();

      await writeFileAsync(PROFILE_FILE_PATH, profile);

      await nationalityIdVerificationPage.closeCarousel();
      await nationalityIdVerificationPage.saveAuth();

      await closeBrowser({ browser });
    },
  });
}

export async function logout() {
  const { browser, page } = await createBrowser({
    browserContextOptions: { storageState: AUTH_FILE_PATH },
  });

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
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
  options: { redirect } = { redirect: true },
}: ScrapQuotaAllocationArgs) {
  const salePage = new SalePage(page);

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

  if (redirect) {
    await salePage.changeCustomer();
  }

  return quotaAllocation;
}

export async function scrapQuotaAllocations({ page, customer }: ScrapQuotaAllocationsArgs) {
  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);
  const quotaAllocations = [];

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

  await nationalityIdVerificationPage.fillNationalityIdVerificationInput(nationalityId);
  const customer = await nationalityIdVerificationPage.waitForCustomer({
    nationalityId,
    trigger: () => nationalityIdVerificationPage.submitNationalityIdVerificationForm(),
  });

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

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await nationalityIdVerificationPage.goto();

      for (const flaggedNationalityId of flaggedNationalityIds) {
        await scrapQuota({ page, flaggedNationalityId });
      }

      await closeBrowser({ browser });
    },
  });
}

export async function createOrder({
  page,
  flaggedOrder: { nationalityId, customerType, quantity, flag },
}: CreateOrderArgs) {
  if (flag) {
    return;
  }

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);
  const salePage = new SalePage(page);

  await nationalityIdVerificationPage.fillNationalityIdVerificationInput(nationalityId);
  const customer = await nationalityIdVerificationPage.waitForCustomer({
    nationalityId,
    trigger: () => nationalityIdVerificationPage.submitNationalityIdVerificationForm(),
  });

  await updateFlaggedOrdersFile(nationalityId);

  if (!customer) {
    await nationalityIdVerificationPage.waitForTimeout();
    return;
  }

  const quotaAllocation = await scrapQuotaAllocation({
    page,
    customer,
    selectedCustomerType: customerType,
    options: { redirect: false },
  });

  if (!quotaAllocation) {
    await nationalityIdVerificationPage.waitForTimeout();
    return;
  }

  if (
    (await salePage.isFamilyQuotaExceed()) ||
    (await salePage.isMerchantQuotaExceed()) ||
    quantity > (await salePage.getMerchantQuota()) ||
    quantity > quotaAllocation.quantity ||
    quantity > 5
  ) {
    await nationalityIdVerificationPage.goto();
    await nationalityIdVerificationPage.waitForTimeout();
    return;
  }

  await salePage.increaseOrderQuantity(quantity);
  await salePage.checkOrder();
  await salePage.waitForOrderURL();
  await salePage.submitOrderCreationForm();
  await salePage.waitForStructURL();

  const transaction = await salePage.waitForTransaction({ nationalityId, customerType, quantity });

  await updateTransactionsFile(transaction);

  await nationalityIdVerificationPage.goto();
  await nationalityIdVerificationPage.waitForTimeout();
}

export async function createOrders(flaggedOrders: FlaggedOrder[]) {
  const { browser, page } = await createBrowser({
    browserContextOptions: {
      storageState: AUTH_FILE_PATH,
    },
  });

  const nationalityIdVerificationPage = new NationalityIdVerificationPage(page);

  await closeBrowserOnError({
    browser,
    callback: async () => {
      await nationalityIdVerificationPage.goto();

      for (const flaggedOrder of flaggedOrders) {
        await createOrder({ page, flaggedOrder });
      }

      await closeBrowser({ browser });
    },
  });
}

export function generateOrdersFromQuotas({ quotas, quantity }: GenerateOrdersFromQuotasArgs) {
  const orders: Order[] = [];

  for (const quota of quotas) {
    for (const allocation of quota.allocations) {
      const order: Order = {
        nationalityId: quota.nationalityId,
        customerType: allocation.customerType,
        quantity: allocation.quantity >= quantity ? quantity : allocation.quantity,
      };

      if (allocation.isValid && order.quantity > 0) {
        orders.push(order);
      }
    }
  }

  return orders;
}
