/* eslint-disable functional/no-let */
/* eslint-disable import/order */

// export * from './lib/async';
// export * from './lib/number';

import dotenv from 'dotenv'

import * as cron from 'node-cron'

dotenv.config()

import { syncLicenseUsageLogs } from './lib/license-usage-logs/license-usage-logs-sync'

/**
 * This script should be executed periodically, recommended once in a minute.
 * BlinkID Verify Server and FaceTec Server writes logs to the disk and this script reads
 * them and sends to the Microblink's License Usage Logs Server.
 *
 * With environment variable CRON_SCHEDULE set cron schedule expression with desired cron job execution period.
 */

 let isSyncInProgress = false
 let currentSyncId = 0

if (process.env.CRON_SCHEDULE) {
  cron.schedule(process.env.CRON_SCHEDULE, async () => {

    /**
     * NOTE: if process.env.CRON_SCHEDULE is too frequent for example every second than this will protect to run
     * multiple syncs in parallel
     */
    if (isSyncInProgress) {
      console.log('SKIPPED.sync.alreadyInProgress.syncId', currentSyncId)
      return
    }

    isSyncInProgress = true

    try {
      await syncLicenseUsageLogs()
    } catch(error) {
      console.error('cron.top.level.error', error)
    }

    isSyncInProgress = false
    currentSyncId += 1

  });
} else {

  /**
   * NOTE: for development purposes when env. var. CRON_SCHEDULE is not defined application will be execute once.
   */
  (async (): Promise<void> => {
    try {
      await syncLicenseUsageLogs()
    } catch(error) {
      console.error('dev.top.level.error', error)
    }
  })()
}




