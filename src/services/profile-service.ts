import type { Page } from '@playwright/test';

import { mapProfileRecordToProfile } from '../libs/dto.ts';
import VerificationPage from '../pages/verification-page.ts';
import { profileResponseSchema } from '../schemas/profile-record.ts';

export default class ProfileService {
  private readonly verificationPage: VerificationPage;

  constructor(page: Page) {
    this.verificationPage = new VerificationPage(page);
  }

  private async getProfileFromResponse() {
    const response = await this.verificationPage.waitForProfileResponse();
    const apiResponse = await response.json();
    const profileResponse = profileResponseSchema.parse(apiResponse);
    return mapProfileRecordToProfile(profileResponse);
  }

  public async getProfile() {
    return this.getProfileFromResponse();
  }
}
