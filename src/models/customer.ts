import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerFlags, CustomerType } from '../libs/types.ts';
import { Profile } from '../schemas/file.ts';

export default class Customer {
  private readonly nationalityId: string;
  private readonly encryptedFamilyId?: string;
  private readonly types: {
    name: CustomerType;
    mid: string | null;
  }[];
  private readonly flags: CustomerFlags;
  private readonly baseProfile: Profile;

  constructor({
    nationalityId,
    encryptedFamilyId,
    customerTypes,
    customerFlags,
    profile,
  }: CustomerArgs) {
    this.nationalityId = nationalityId;
    this.encryptedFamilyId = encryptedFamilyId;
    this.types = customerTypes;
    this.flags = customerFlags;
    this.baseProfile = profile;
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

  public getTypeNames() {
    return this.types.map((type) => type.name);
  }

  public getFlags() {
    return this.flags;
  }

  public getBaseProfile() {
    return this.baseProfile;
  }

  public hasMultipleTypes() {
    return this.types.length >= 2;
  }

  public hasSimilarRegisterLocation() {
    const retailer = this.types.find((type) => type.name === 'Pengecer');

    return retailer && retailer.mid === this.baseProfile.mid;
  }
}
