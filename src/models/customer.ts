import type { CustomerArgs } from '../libs/args.ts';
import type { CustomerDTO } from '../schemas/customer-dto.ts';
import type { CustomerResponse, CustomerType } from '../schemas/customer-response.ts';

export default class Customer {
  private nationalityID: string;
  private encryptedFamilyID: string;
  private types: CustomerType[];
  private selectedType: CustomerType;

  constructor({ nationalityID, encryptedFamilyID, types }: CustomerArgs) {
    const [type] = types;

    this.nationalityID = nationalityID;
    this.encryptedFamilyID = encryptedFamilyID;
    this.types = types;
    this.selectedType = type;
  }

  public getNationalityID() {
    return this.nationalityID;
  }

  public getEncryptedFamilyID() {
    return this.encryptedFamilyID;
  }

  public getSelectedType() {
    return this.selectedType;
  }

  public hasMultipleTypes() {
    return this.types.length >= 2;
  }

  public toDTO(): CustomerDTO {
    return {
      nationalityID: this.nationalityID,
      encryptedFamilyID: this.encryptedFamilyID,
      types: this.types,
    };
  }

  public static fromResponse(response: CustomerResponse): Customer {
    return new Customer(this.fromResponseToDTO(response));
  }

  private static fromResponseToDTO(response: CustomerResponse): CustomerDTO {
    return {
      nationalityID: response.data.nationalityId,
      encryptedFamilyID: response.data.familyIdEncrypted,
      types: response.data.customerTypes.map((type) => type.name),
    };
  }
}
