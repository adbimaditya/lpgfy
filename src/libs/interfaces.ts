import { QuotaAllocation } from '../schemas/file.ts';

export interface CustomerScraper {
  scrapQuotaAllocation(): Promise<QuotaAllocation | null>;
}
