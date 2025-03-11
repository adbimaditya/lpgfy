import FlaggedNationalityIDsFile from '../models/flagged-nationality-ids-file.ts';
import { type CustomerType, type FlaggedNationalityID } from '../schemas/customer.ts';

export function encodeCustomerType(type: CustomerType) {
  return type.replace(' ', '+');
}

export async function getUnprocessedFlaggedNationalityIDs(): Promise<FlaggedNationalityID[]> {
  const flaggedNationalityIDs = await FlaggedNationalityIDsFile.get();

  return flaggedNationalityIDs.filter((flaggedNationalityID) => !flaggedNationalityID.flag);
}
