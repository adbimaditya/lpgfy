export const BASE_ENDPOINT = 'https://api-map.my-pertamina.id';
export const VERIFY_NATIONALITY_ID_ENDPOINT = `${BASE_ENDPOINT}/customers/v2/verify-nik`;
export const QUOTA_ENDPOINT = (nationalityID: string) =>
  `${BASE_ENDPOINT}/general/v4/customers/${nationalityID}/quota`;
