import type { Page } from '@playwright/test';
import status from 'http-status';

import type { GetQuotaAllocationArgs } from '../libs/args.ts';
import {
  NATIONALITY_ID_VERIFICATION_DELAY,
  NATIONALITY_ID_VERIFICATION_ENDPOINT,
  NATIONALITY_ID_VERIFICATION_URL,
  PROFILE_ENDPOINT,
  QUOTA_ENDPOINT,
} from '../libs/constants.ts';
import {
  customerResponseToCustomer,
  profileRecordToProfile,
  quotaRecordToQuotaAllocation,
} from '../libs/dto.ts';
import { encodeCustomerType, getProfileFromFile } from '../libs/utils.ts';
import { customerResponseSchema } from '../schemas/customer-record.ts';
import { profileResponseSchema } from '../schemas/profile-record.ts';
import { quotaResponseSchema } from '../schemas/quota-record.ts';

export default class NationalityIdVerificationPage {
  private readonly url: string = NATIONALITY_ID_VERIFICATION_URL;
  private readonly timeout: number = NATIONALITY_ID_VERIFICATION_DELAY;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(options?: Parameters<typeof this.page.goto>[1]) {
    await this.page.goto(this.url, options);
  }

  public async waitForTimeout() {
    await this.page.waitForTimeout(NATIONALITY_ID_VERIFICATION_DELAY);
  }

  public async fillNationalityIdVerificationInput(nationalityId: string) {
    await this.page.getByPlaceholder('Masukkan 16 digit NIK KTP Pelanggan').fill(nationalityId);
  }

  public async submitNationalityIdVerificationForm() {
    await this.page.getByTestId('btnNav/app/verification-nik').click();
    await this.page.getByRole('button', { name: 'Cek' }).click();
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

  public async logout() {
    await this.page.getByTestId('btnLogout').click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Keluar' }).click();
  }

  public async getProfile() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' && response.request().url() === PROFILE_ENDPOINT,
    );

    const response = await responsePromise;
    const apiResponse = await response.json();
    const profileResponse = profileResponseSchema.parse(apiResponse);
    const profile = profileRecordToProfile(profileResponse);

    return profile;
  }

  public async getCustomer(nationalityId: string) {
    await this.fillNationalityIdVerificationInput(nationalityId);

    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url() ===
          `${NATIONALITY_ID_VERIFICATION_ENDPOINT}?nationalityId=${nationalityId}`,
    );

    await this.submitNationalityIdVerificationForm();

    const response = await responsePromise;

    if (!response.ok()) {
      if (response.status() === status.NOT_FOUND) {
        await this.closeCustomerTypeSelectionDialog();
      }

      return null;
    }

    const profile = await getProfileFromFile();
    const apiResponse = await response.json();
    const customerResponse = customerResponseSchema.parse(apiResponse);
    const customer = customerResponseToCustomer({
      customerResponse: { ...customerResponse, data: { ...customerResponse.data, nationalityId } },
      profile,
    });

    return customer;
  }

  public async getQuotaAllocation({
    nationalityId,
    encryptedFamilyId,
    selectedCustomerType,
  }: GetQuotaAllocationArgs) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.request().url() ===
          `${QUOTA_ENDPOINT(nationalityId)}?familyId=${encryptedFamilyId ? encodeURIComponent(encryptedFamilyId) : ''}&customerType=${encodeCustomerType(selectedCustomerType)}`,
    );

    const response = await responsePromise;
    const apiResponse = await response.json();
    const { data: quotaRecord } = quotaResponseSchema.parse(apiResponse);
    const quotaAllocation = quotaRecordToQuotaAllocation({
      customerType: selectedCustomerType,
      quotaRecord,
    });

    return quotaAllocation;
  }
}
