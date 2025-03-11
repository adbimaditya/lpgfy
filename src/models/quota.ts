import type { QuotaArgs } from '../libs/args.ts';
import type { CustomerType } from '../schemas/customer.ts';
import type { QuotaDTO } from '../schemas/quota.ts';

export default class Quota {
  private nationalityID: string;
  private type: CustomerType;
  private quantity: number;

  constructor({ nationalityID, type, quantity }: QuotaArgs) {
    this.nationalityID = nationalityID;
    this.type = type;
    this.quantity = quantity;
  }

  public getNationalityID() {
    return this.nationalityID;
  }

  public toDTO(): QuotaDTO {
    return {
      nationalityID: this.nationalityID,
      type: this.type,
      quantity: this.quantity,
    };
  }
}
