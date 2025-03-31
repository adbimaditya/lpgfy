import { input, password } from '@inquirer/prompts';

import ora from 'ora';
import { login, logout, scrapQuotas } from './my-pertamina.ts';

export async function loginAction() {
  const identifier = await input({
    message: 'Please enter your email address or phone number:',
    required: true,
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneNumberRegex = /^\d{10,13}$/;

      if (emailRegex.test(value) || phoneNumberRegex.test(value)) {
        return true;
      }

      return 'Invalid identifier. Please enter a valid email address or a phone number with 10 to 13 digits.';
    },
  });
  const pin = await password({
    message: 'Enter your 6-digit PIN:',
    validate: (value) => {
      const pinRegex = /^\d{6}$/;

      if (pinRegex.test(value)) {
        return true;
      }

      return 'Invalid PIN. Please enter exactly 6 digits.';
    },
  });

  const spinner = ora('Logging in...');

  spinner.start();
  await login({ identifier, pin });
  spinner.succeed('User logged in successfully.');
}

export async function logoutAction() {
  const spinner = ora('Logging out...');

  spinner.start();
  await logout();
  spinner.succeed('User logged out successfully.');
}

export async function scrapQuotasAction() {
  const spinner = ora('Scraping quotas...');

  spinner.start();
  await scrapQuotas();
  spinner.succeed('Quota scraping completed successfully.');
}
