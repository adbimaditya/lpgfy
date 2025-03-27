export const BASE_URL = 'https://subsiditepatlpg.mypertamina.id';
export const LOGIN_URL = `${BASE_URL}/merchant/auth/login`;
export const NATIONALITY_ID_VERIFICATION_URL = `${BASE_URL}/merchant/app/verification-nik`;

export const BASE_ENDPOINT = 'https://api-map.my-pertamina.id';
export const NATIONALITY_ID_VERIFICATION_ENDPOINT = `${BASE_ENDPOINT}/customers/v2/verify-nik`;
export const QUOTA_ENDPOINT = (nationalityId: string) =>
  `${BASE_ENDPOINT}/general/v4/customers/${nationalityId}/quota`;

export const NATIONALITY_ID_LENGTH = 16;
export const FAMILY_ID_LENGTH = 16;
export const MY_LUCKY_NUMBER = 7;
