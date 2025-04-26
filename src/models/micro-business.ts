import type { CustomerScraper } from '../libs/interfaces.ts';
import VerificationPage from '../pages/verification-page.ts';
import type { CustomerScrapperConstructorArgs } from '../types/constructor.ts';
import Customer from './customer.ts';

export default class MicroBusiness extends Customer implements CustomerScraper {
  private readonly selectionLabel: string = 'Usaha Mikro';
  private readonly verificationPage: VerificationPage;

  constructor({ page, ...args }: CustomerScrapperConstructorArgs) {
    super(args);

    this.verificationPage = new VerificationPage(page);
  }

  private isEligible() {
    const flags = this.getFlags();
    return flags.isBusinessType && flags.isBusinessName;
  }

  private hasRecommendationLetter() {
    const flags = this.getFlags();
    return flags.isRecommendationLetter;
  }

  public async handleBureaucracy() {
    if (this.hasMultipleTypes()) {
      await this.verificationPage.selectCustomerType(this.selectionLabel);
      await this.verificationPage.continueTransaction();
    }

    if (!this.isEligible() && !this.hasRecommendationLetter()) {
      await this.verificationPage.closeUpdateMicroBusinessDataDialog();
      return false;
    }

    if (!this.hasRecommendationLetter()) {
      await this.verificationPage.continueTransactionForDelayedUpdate();
    }

    return true;
  }
}
