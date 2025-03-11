import { FLAGGED_NATIONALITY_IDS_FILE_PATH } from '../libs/constants.ts';
import { readFileAsync, writeFileAsync } from '../libs/file.ts';
import { type FlaggedNationalityID, flaggedNationalityIDsSchema } from '../schemas/customer.ts';

import NationalityIDsFile from './nationality-ids-file.ts';

export default class FlaggedNationalityIDsFile {
  static async get(): Promise<FlaggedNationalityID[]> {
    let flaggedNationalityIDs: FlaggedNationalityID[];
    try {
      const flaggedNationalityIDsJSON = await readFileAsync(FLAGGED_NATIONALITY_IDS_FILE_PATH);
      flaggedNationalityIDs = flaggedNationalityIDsSchema.parse(flaggedNationalityIDsJSON);
    } catch {
      flaggedNationalityIDs = await this.create();
    }

    return flaggedNationalityIDs;
  }

  static async create(): Promise<FlaggedNationalityID[]> {
    const nationalityIDs = await NationalityIDsFile.get();

    return nationalityIDs.map((nationalityID) => ({ nationalityID, flag: false }));
  }

  static async update(nationalityID: string) {
    const flaggedNationalityIDs = await this.get();

    await writeFileAsync(
      FLAGGED_NATIONALITY_IDS_FILE_PATH,
      flaggedNationalityIDs.map((flaggedNationalityID) => ({
        ...flaggedNationalityID,
        flag: flaggedNationalityID.nationalityID === nationalityID || flaggedNationalityID.flag,
      })),
    );
  }
}
