import path from 'path';

export const BASE_URL = 'https://subsiditepatlpg.mypertamina.id';
export const LOGIN_URL = `${BASE_URL}/merchant/auth/login`;
export const NATIONALITY_ID_VERIFICATION_URL = `${BASE_URL}/merchant/app/verification-nik`;
export const SALE_URL = `${BASE_URL}/merchant/app/sale`;

export const BASE_ENDPOINT = 'https://api-map.my-pertamina.id';
export const PROFILE_ENDPOINT = `${BASE_ENDPOINT}/general/v1/users/profile`;
export const NATIONALITY_ID_VERIFICATION_ENDPOINT = `${BASE_ENDPOINT}/customers/v2/verify-nik`;
export const QUOTA_ENDPOINT = (nationalityId: string) =>
  `${BASE_ENDPOINT}/general/v4/customers/${nationalityId}/quota`;

export const NATIONALITY_ID_LENGTH = 16;
export const FAMILY_ID_LENGTH = 16;

export const CUSTOMER_TYPES = ['Rumah Tangga', 'Usaha Mikro', 'Pengecer'] as const;
export const CHANNEL_INJECTS = ['tnp2k', 'maplite', 'bpum'] as const;

export const AUTH_FILE_PATH = path.resolve('public', 'data', 'auth.json');
export const PROFILE_FILE_PATH = path.resolve('public', 'data', 'profile.json');
export const FLAGGED_NATIONALITY_IDS_FILE_PATH = path.resolve(
  'public',
  'data',
  'flagged-nationality-ids.json',
);
export const QUOTAS_FILE_PATH = path.resolve('public', 'data', 'quotas.json');

export const NATIONALITY_ID_VERIFICATION_DELAY = 6 * 1000;
export const MY_LUCKY_NUMBER = 7;
