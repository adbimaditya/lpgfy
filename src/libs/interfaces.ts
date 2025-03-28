import { QuotaRecord } from '../schemas/quota-record.ts';

export interface CustomerScraper {
  scrapQuotaRecord(): Promise<QuotaRecord | null>;
}
