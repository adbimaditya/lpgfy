import { NATIONALITY_IDS_FILE_PATH } from '../libs/constants.ts';
import { readFileAsync } from '../libs/file.ts';
import { nationalityIDsSchema } from '../schemas/customer.ts';

export default class NationalityIDsFile {
  static async get(): Promise<string[]> {
    const nationalityIDsJSON = await readFileAsync(NATIONALITY_IDS_FILE_PATH);
    const nationalityIDs = nationalityIDsSchema.parse(nationalityIDsJSON);

    return nationalityIDs;
  }
}
