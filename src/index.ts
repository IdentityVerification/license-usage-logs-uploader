/* eslint-disable import/order */

// export * from './lib/async';
// export * from './lib/number';

import dotenv from 'dotenv'

import * as cron from 'node-cron'

dotenv.config()

import { syncLicenseUsageLogs } from './lib/license-usage-logs/license-usage-logs-sync'

// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second 004');
// });

/**
 * This script should be executed periodically, recommended once in a minute.
 * BlinkID Verify Server and FaceTec Server writes logs to the disk and this script reads
 * them and sends to the Microblink's License Usage Logs Server.
 */
(async (): Promise<void> => {
  try {

    await syncLicenseUsageLogs()



  } catch(error) {
    console.error('top.level.error', error)
  }
})()


