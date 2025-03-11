import { QUOTAS_FILE_PATH } from '../libs/constants.ts';
import { createQuota } from '../libs/factory.ts';
import { readFileAsync, writeFileAsync } from '../libs/file.ts';
import { quotasDTOSchema } from '../schemas/quota.ts';

import Quota from './quota.ts';

export default class QuotasFile {
  static async get(): Promise<Quota[]> {
    let quotas: Quota[];
    try {
      const quotasJSON = await readFileAsync(QUOTAS_FILE_PATH);
      const quotasDTO = quotasDTOSchema.parse(quotasJSON);

      quotas = quotasDTO.map((quotaDTO) => createQuota(quotaDTO));
    } catch {
      await this.create();

      quotas = [];
    }

    return quotas;
  }

  static async create() {
    await writeFileAsync(QUOTAS_FILE_PATH, []);
  }

  static async update(newQuota: Quota) {
    const quotas = await this.get();

    await writeFileAsync(QUOTAS_FILE_PATH, [
      ...quotas.map((quota) => quota.toDTO()),
      newQuota.toDTO(),
    ]);
  }
}
