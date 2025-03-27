import type { Page } from '@playwright/test';
import path from 'path';

import { LOGIN_URL } from '../libs/constants.ts';

export default class LoginPage {
  private readonly url: string = LOGIN_URL;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(options?: Parameters<typeof this.page.goto>[1]) {
    await this.page.goto(this.url, options);
  }

  public async fillIdentifierInput(phoneNumber: string) {
    await this.page.getByPlaceholder('Email atau No. Handphone').fill(phoneNumber);
  }

  public async fillPinInput(pin: string) {
    await this.page.getByPlaceholder('PIN (6-digit)').fill(pin);
  }

  public async submitLoginForm() {
    await this.page.getByRole('button', { name: 'Masuk' }).click();
  }

  public async saveAuth() {
    await this.page.context().storageState({ path: path.resolve('public', 'data', 'auth.json') });
  }

  public async closeCarousel() {
    await this.page.getByTestId(/^btnClose.*/).click();
  }
}
