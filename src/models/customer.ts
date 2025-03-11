import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerDTO, CustomerFlags, CustomerType } from '../schemas/customer.ts';

export default class Customer {
  private nationalityID: string;
  private encryptedFamilyID?: string;
  private types: CustomerType[];
  private flags: CustomerFlags;

  constructor({ nationalityID, encryptedFamilyID, types, flags }: CustomerArgs) {
    this.nationalityID = nationalityID;
    this.encryptedFamilyID = encryptedFamilyID;
    this.types = types;
    this.flags = flags;
  }

  public getNationalityID() {
    return this.nationalityID;
  }

  public getEncryptedFamilyID() {
    return this.encryptedFamilyID;
  }

  public hasMultipleTypes() {
    return this.types.length >= 2;
  }

  public getFlags() {
    return this.flags;
  }

  public toDTO(): CustomerDTO {
    return {
      nationalityID: this.nationalityID,
      encryptedFamilyID: this.encryptedFamilyID,
      types: this.types,
      flags: this.flags,
    };
  }
}
