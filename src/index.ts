/* eslint-disable functional/no-let */
/* eslint-disable import/order */

import dotenv from 'dotenv'
import cronstrue from 'cronstrue'
import express from 'express';
import moment from 'moment'

import * as cron from 'node-cron'

dotenv.config()

import { syncLicenseUsageLogs } from './lib/license-usage-logs/license-usage-logs-sync'

const cronScheduleDisplayInfo = () => {
  const cronScheduleAsHumanReadableString = cronstrue.toString(process.env.CRON_SCHEDULE)
  console.log('---------------------------------------------------------')
  console.log(`INFO: this script is running as cron job with cron expression from env. var. 'CRON_SCHEDULE'`)
  console.log(`CRON_SCHEDULE = '${process.env.CRON_SCHEDULE}' is equal to '${cronScheduleAsHumanReadableString}'`)
  console.log('---------------------------------------------------------')
  console.log('')
}

/**
 * This script should be executed periodically, recommended once in a minute.
 * BlinkID Verify Server and FaceTec Server writes logs to the disk and this script reads
 * them and sends to the Microblink's License Usage Logs Server.
 *
 * With environment variable CRON_SCHEDULE set cron schedule expression with desired cron job execution period.
 */

let isSyncInProgress = false
let nextSyncId = 0
const bootTime = moment()

if (process.env.CRON_SCHEDULE) {
  cronScheduleDisplayInfo()
  cron.schedule(process.env.CRON_SCHEDULE, async () => {

    /**
     * NOTE: if process.env.CRON_SCHEDULE is too frequent for example every second than this will protect to run
     * multiple syncs in parallel
     */
    if (isSyncInProgress) {
      console.log('SKIPPED.sync.alreadyInProgress.syncId', nextSyncId)
      return
    }

    isSyncInProgress = true

    try {
      await syncLicenseUsageLogs(nextSyncId)
    } catch (error) {
      console.error('cron.top.level.error', error)
      process.exit(1)
    }

    isSyncInProgress = false
    nextSyncId += 1

    cronScheduleDisplayInfo()

  });
} else {

  /**
   * NOTE: for development purposes when env. var. CRON_SCHEDULE is not defined application will be execute once.
   */
  (async (): Promise<void> => {
    try {
      await syncLicenseUsageLogs(nextSyncId)
    } catch (error) {
      console.error('dev.top.level.error', error)
      process.exit(1)
    }
    if (app?.close) {
      app?.close()
    }
    process.exit(0)
  })()
}

/**
 * Simple web server for exposing health check endpoint
 */
const app = express();

app.get('/', (req, res) => {
  res.send({
    summary: 'Welcome to microblink-license-usage-logs-uploader'
  });
})

app.get('/health', (req, res) => {

  const now = moment()
  const upTime = now.diff(bootTime, 'days') + ' days, ' + moment.utc(now.diff(bootTime)).format("HH:mm:ss")
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024 + ' MB'

  res.send({
    summary: 'microblink-license-usage-logs-uploader is operational',
    status: true,
    appName: 'microblink-license-usage-logs-uploader',
    appVersion: '0.4.2',
    appBuild: '2021-05-27',
    isSyncInProgress: isSyncInProgress,
    currentSyncId: (nextSyncId - 1) >= 0 ? nextSyncId - 1 : null,
    nextSyncId: nextSyncId,
    bootTime: bootTime.utc().format(),
    upTime: upTime,
    cronScheduleExpression: process.env.CRON_SCHEDULE,
    cronScheduleDescription: cronstrue.toString(process.env.CRON_SCHEDULE),
    memoryUsage: memoryUsage,
  });
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
})




