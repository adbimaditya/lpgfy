/* eslint-disable no-unused-vars */

import type { Page } from '@playwright/test';

import Quota from '../models/quota.ts';

export interface Customer {
  getQuota(page: Page): Promise<Quota | null>;
}
