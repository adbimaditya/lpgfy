import type { Page } from '@playwright/test';

import { LOGIN_URL } from '../libs/constants.ts';

export default class VerificationPage {
  private readonly url: string = LOGIN_URL;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(options?: Parameters<typeof this.page.goto>[1]) {
    await this.page.goto(this.url, options);
  }

  public async fillNationalityIdVerificationInput(nationalityId: string) {
    await this.page.getByPlaceholder('Masukkan 16 digit NIK KTP Pelanggan').fill(nationalityId);
  }

  public async submitNationalityIdVerificationForm() {
    await this.page.getByRole('heading', { name: 'NIK KTP Pelanggan' }).click();
    await this.page.getByRole('button', { name: 'Cek' }).click();
  }

  public async logout() {
    await this.page.getByTestId('btnLogout').click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Keluar' }).click();
  }
}
