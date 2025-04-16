import { Command } from 'commander';

import {
  createOrdersAction,
  generateOrdersFromQuotasAction,
  loginAction,
  logoutAction,
  scrapQuotasAction,
} from './libs/command.ts';

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
program
  .command('create-orders')
  .requiredOption('-f, --file <path>', 'Path to the file to process')
  .description('Create new orders from the provided file.')
  .action(createOrdersAction);
program
  .command('generate-orders')
  .description('Generate orders from the quotas file.')
  .action(generateOrdersFromQuotasAction);

await program.parseAsync(process.argv);
