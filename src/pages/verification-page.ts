import type { Page } from '@playwright/test';

import {
  AUTH_FILE_PATH,
  PROFILE_ENDPOINT,
  QUOTA_ENDPOINT,
  VERIFICATION_DELAY,
  VERIFICATION_ENDPOINT,
  VERIFICATION_URL,
} from '../libs/constants.ts';
import { encodeCustomerType } from '../libs/utils.ts';
import type { WaitForCustomerResponseArgs, WaitForQuotaResponse } from '../types/page.ts';

export default class VerificationPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(options?: Parameters<typeof this.page.goto>[1]) {
    await this.page.goto(VERIFICATION_URL, options);
  }

  public async reload() {
    await this.page.reload();
  }

  public async waitForTimeout() {
    await this.page.waitForTimeout(VERIFICATION_DELAY);
  }

  public async saveAuth() {
    await this.page.context().storageState({ path: AUTH_FILE_PATH });
  }

  public async fillNationalityIdVerificationInput(nationalityId: string) {
    await this.page.getByPlaceholder('Masukkan 16 digit NIK KTP Pelanggan').fill(nationalityId);
  }

  public async submitNationalityIdVerificationForm() {
    await this.page.getByTestId('btnNav/app/verification-nik').click();
    await this.page.getByRole('button', { name: 'Cek' }).click();
  }

  public async logout() {
    await this.page.getByTestId('btnLogout').click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Keluar' }).click();
  }

  public async selectCustomerType(customerType: string) {
    await this.page.getByRole('dialog').getByText(customerType).click();
  }

  public async continueTransaction() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Lanjut Transaksi' }).click();
  }

  public async continueTransactionForDelayedUpdate() {
    await this.page.getByRole('button', { name: 'Lewati, Lanjut Transaksi' }).click();
  }

  public async closeCustomerTypeSelectionDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();
  }

  public async closeUpdateMicroBusinessDataDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Kembali' }).click();
  }

  public async closeRetailerLocationDialog() {
    await this.page.getByTestId('btnCancel').filter({ hasText: 'Tutup' }).click();
  }

  public async closeCarousel() {
    await this.page.getByTestId(/^btnClose.*/).click();
  }

  public async waitForProfileResponse() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' && response.request().url() === PROFILE_ENDPOINT,
    );

    return responsePromise;
  }

  public async waitForCustomerResponse({ nationalityId, trigger }: WaitForCustomerResponseArgs) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url() === `${VERIFICATION_ENDPOINT}?nationalityId=${nationalityId}`,
    );

    await trigger();

    return responsePromise;
  }

  public async waitForQuotaResponse({
    nationalityId,
    encryptedFamilyId,
    selectedCustomerType,
  }: WaitForQuotaResponse) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url() ===
          `${QUOTA_ENDPOINT(nationalityId)}?familyId=${encryptedFamilyId ? encodeURIComponent(encryptedFamilyId) : ''}&customerType=${encodeCustomerType(selectedCustomerType)}`,
    );

    return responsePromise;
  }
}
