import type { CustomerConstructorArgs } from '../types/constructor.ts';
import type { CustomerFlags, CustomerType, CustomerTypeDetails, Profile } from '../types/model.ts';

export default class Customer {
  private readonly nationalityId: string;
  private readonly encryptedFamilyId?: string;
  private readonly types: CustomerTypeDetails[];
  private readonly flags: CustomerFlags;
  private readonly baseProfile: Profile;

  constructor({
    nationalityId,
    encryptedFamilyId,
    customerTypes,
    customerFlags,
    profile,
  }: CustomerConstructorArgs) {
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

  public hasValidQuotaForSelectedCustomerType(customerType: CustomerType) {
    const selectedCustomerType = this.types.find((type) => type.name === customerType);
    return !!selectedCustomerType && selectedCustomerType.isQuotaValid;
  }
}
