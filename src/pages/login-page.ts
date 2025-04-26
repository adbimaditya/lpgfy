import type { Page } from '@playwright/test';

import { LOGIN_URL } from '../libs/constants.ts';

export default class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(options?: Parameters<typeof this.page.goto>[1]) {
    await this.page.goto(LOGIN_URL, options);
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
}
