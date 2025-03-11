/* eslint-disable no-unused-vars */

import type { Page } from '@playwright/test';

import Quota from '../models/quota.ts';

export interface ICustomerType {
  getQuota(page: Page): Promise<Quota | null>;
}
