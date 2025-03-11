export const BASE_URL = 'https://subsiditepatlpg.mypertamina.id';
export const LOGIN_URL = `${BASE_URL}/merchant/auth/login`;

export const BASE_ENDPOINT = 'https://api-map.my-pertamina.id';
export const VERIFY_NATIONALITY_ID_ENDPOINT = `${BASE_ENDPOINT}/customers/v2/verify-nik`;

export const QUOTA_ENDPOINT = (nationalityID: string) =>
  `${BASE_ENDPOINT}/general/v4/customers/${nationalityID}/quota`;

export const VERIFY_NATIONALITY_ID_DELAY = 6_000;
export const NATIONALITY_ID_LENGTH = 16;
export const QUOTAS_FILE_PATH = 'public/data/quotas.json';
