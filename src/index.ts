import retry from 'async-retry';
import { Command } from 'commander';

import { loginAction, logoutAction, scrapQuotasAction } from './libs/command.ts';
import { MY_LUCKY_NUMBER } from './libs/constants.ts';

async function main() {
  const program = new Command();

  program
    .name('lpgfy')
    .description(
      'Command-line tool for automating tasks within the Subsidi Tepat LPG section of the My Pertamina website.',
    )
    .version('1.0.0');

  program
    .command('login')
    .description('Authenticate with your My Pertamina account.')
    .action(loginAction);
  program
    .command('logout')
    .description('Log out from your My Pertamina account.')
    .action(logoutAction);
  program
    .command('scrap-quotas')
    .requiredOption('-f, --file <path>', 'Path to the file to process')
    .description('Scrap LPG quota information.')
    .action(scrapQuotasAction);

  await program.parseAsync(process.argv);
}

retry(main, { retries: MY_LUCKY_NUMBER });
