import type { QuotaArgs } from '../libs/args.ts';
import type { CustomerType } from '../schemas/customer-response.ts';
import type { QuotaDTO } from '../schemas/quota-dto.ts';
import type { QuotaResponse } from '../schemas/quota-response.ts';

import Customer from './customer.ts';

export default class Quota {
  private nationalityID: string;
  private type: CustomerType;
  private quantity: number;

  constructor({ nationalityID, type, quantity }: QuotaArgs) {
    this.nationalityID = nationalityID;
    this.type = type;
    this.quantity = quantity;
  }

  public toDTO(): QuotaDTO {
    return {
      nationalityID: this.nationalityID,
      type: this.type,
      quantity: this.quantity,
    };
  }

  public static fromResponse(response: QuotaResponse, customer: Customer): Quota {
    return new Quota(this.fromResponseToDTO(response, customer));
  }

  private static fromResponseToDTO(response: QuotaResponse, customer: Customer): QuotaDTO {
    return {
      nationalityID: customer.getNationalityID(),
      type: customer.getSelectedType(),
      quantity: response.data.quotaRemaining.daily,
    };
  }
}
