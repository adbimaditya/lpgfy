import retry from 'async-retry';

import { MY_LUCKY_NUMBER } from './libs/constants.ts';
import { getIsAuthenticated, login, scrapQuotas } from './libs/my-pertamina.ts';

async function main() {
  const isAuthenticated = await getIsAuthenticated();

  if (!isAuthenticated) {
    await login();
  }

  await scrapQuotas();
}

retry(main, { retries: MY_LUCKY_NUMBER });
