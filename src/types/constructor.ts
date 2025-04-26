import type { Page } from '@playwright/test';

import type { CustomerFlags, CustomerType, Profile } from './model.ts';

export type CustomerConstructorArgs = {
  nationalityId: string;
  encryptedFamilyId?: string;
  customerTypes: {
    name: CustomerType;
    mid: string | null;
    isQuotaValid: boolean;
  }[];
  customerFlags: CustomerFlags;
  profile: Profile;
};

export type CustomerScrapperConstructorArgs = {
  page: Page;
} & CustomerConstructorArgs;
