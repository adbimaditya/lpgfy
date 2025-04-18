import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerFlags, CustomerType, Profile } from '../libs/types.ts';

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
}
