import type { CustomerScraper } from '../libs/interfaces.ts';
import VerificationPage from '../pages/verification-page.ts';
import type { CustomerScrapperConstructorArgs } from '../types/constructor.ts';
import type { CustomerType } from '../types/model.ts';
import Customer from './customer.ts';

export default class Household extends Customer implements CustomerScraper {
  private readonly selectionLabel: CustomerType = 'Rumah Tangga';
  private readonly verificationPage: VerificationPage;

  constructor({ page, ...args }: CustomerScrapperConstructorArgs) {
    super(args);

    this.verificationPage = new VerificationPage(page);
  }

  public async handleBureaucracy() {
    if (this.hasMultipleTypes()) {
      await this.verificationPage.selectCustomerType(this.selectionLabel);
      await this.verificationPage.continueTransaction();
    }

    return true;
  }
}
