import type { CustomerScraper } from '../libs/interfaces.ts';
import VerificationPage from '../pages/verification-page.ts';
import type { CustomerScrapperConstructorArgs } from '../types/constructor.ts';
import Customer from './customer.ts';

export default class Retailer extends Customer implements CustomerScraper {
  private readonly selectionLabel: string = 'Sub Pangkalan';
  private readonly verificationPage: VerificationPage;

  constructor({ page, ...args }: CustomerScrapperConstructorArgs) {
    super(args);

    this.verificationPage = new VerificationPage(page);
  }

  private hasSimilarRegisterLocation() {
    const types = this.getTypes();
    const baseProfile = this.getBaseProfile();
    const retailer = types.find((type) => type.name === 'Pengecer');

    return !!retailer && retailer.mid === baseProfile.mid;
  }

  public async handleBureaucracy() {
    if (this.hasMultipleTypes()) {
      await this.verificationPage.selectCustomerType(this.selectionLabel);
      await this.verificationPage.continueTransaction();
    }

    if (!this.hasSimilarRegisterLocation()) {
      await this.verificationPage.closeRetailerLocationDialog();
      await this.verificationPage.reload(); // * Fix strange behavior when waiting for response after this iteration
      return false;
    }

    return true;
  }
}
