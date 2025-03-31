import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerFlags, CustomerType } from '../libs/types.ts';

export default class Customer {
  private readonly nationalityId: string;
  private readonly encryptedFamilyId?: string;
  private readonly types: CustomerType[];
  private readonly flags: CustomerFlags;

  constructor({ nationalityId, encryptedFamilyId, customerTypes, customerFlags }: CustomerArgs) {
    this.nationalityId = nationalityId;
    this.encryptedFamilyId = encryptedFamilyId;
    this.types = customerTypes;
    this.flags = customerFlags;
  }

  public getNationalityId() {
    return this.nationalityId;
  }

  public getEncryptedFamilyId() {
    return this.encryptedFamilyId;
  }

  public getTypes() {
    return this.types;
  }

  public getFlags() {
    return this.flags;
  }

  public hasMultipleTypes() {
    return this.types.length >= 2;
  }
}
