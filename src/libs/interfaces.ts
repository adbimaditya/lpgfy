import { QuotaAllocation } from './types.ts';

export interface CustomerScraper {
  scrapQuotaAllocation(): Promise<QuotaAllocation | null>;
}
