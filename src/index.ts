/* eslint-disable import/order */

// export * from './lib/async';
// export * from './lib/number';

import dotenv from 'dotenv'
import * as fs from 'fs'
import * as cron from 'node-cron'

dotenv.config()

import { parseFaceTecLogFileName, parseFaceTecLogFileNames } from './lib/license-usage-logs/helpers/facetec.helper'
import * as state from './lib/license-usage-logs/helpers/state.helper'
import { createLogs } from './lib/license-usage-logs/license-usage-logs-client'
import { LicenseUsageLogsRequestBody } from './lib/license-usage-logs/model/license-usage-logs.model'
// import { createLogs } from './lib/license-usage-logs/license-usage-logs-client'
// import { LicenseUsageLogsRequestBody } from './lib/license-usage-logs/model/license-usage-logs.model'


// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second 004');
// });

/**
 * This script should be executed periodically, recommended once in a minute.
 * BlinkID Verify Server and FaceTec Server writes logs to the disk and this script reads
 * them and send them to the Microblink's License Usage Logs Server.
 */
(async () => {
  try {

    /**
     * Filename pattern:
     * `blinkid-verify-license-usage-$DATE.$PROCESS_ID.$SEQUENCE_ID.log`
     *
     * Examples:
     * `blinkid-verify-license-usage-20210521.75966cd401454bbcbc8070306009aee0.00000.log`
     * `blinkid-verify-license-usage-20210521.6a4de17c673748dd824461afda8cb6cf.00001.log`
     * `blinkid-verify-license-usage-20210521.4efa91e36fac432f813676c4e31558e7.00002.log`
     * `blinkid-verify-license-usage-20210522.4efa91e36fac432f813676c4e31558e7.00003.log`
     * `blinkid-verify-license-usage-20210523.4efa91e36fac432f813676c4e31558e7.00004.log`
     */
    const blinkIdVerifyLicenseUsageLogsDirPath = '/Users/stepanic/git/microblink/blinkid-verify-server/app/srv/blinkid-verify-license-usage-logs'
    /**
     * Filename pattern:
     * `facetec-usage-$MACHINE_ID-$DATE.$SEQUENCE_ID.log`
     *
     * Examples:
     * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210521.00000.log`
     * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210522.00001.log`
     * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210523.00002.log`
     *
     */
    const facetecLicenseUsageLogsDirPath = '/Users/stepanic/git/microblink/blinkid-verify-server/app/srv/facetec-license-usage-logs'


    /**
     * To correctly continue license usage logs uploading to the server, load application persistent state from the file.
     * Application state has information about last file uploaded file to the server and last uploaded line from that file.
     * Every line is one log entity.
     */
    const STATE = state.load()

    console.log('STATE.before', STATE)

    const logFileNames = fs.readdirSync(facetecLicenseUsageLogsDirPath)

    const faceTecLogFileNames = parseFaceTecLogFileNames(logFileNames)

    // eslint-disable-next-line functional/no-let
    let logFile = faceTecLogFileNames.values[faceTecLogFileNames.keys.sorted[1]]



    // eslint-disable-next-line functional/immutable-data
    STATE.FACETEC_LAST_LOG_SENT = {
      FILE_SORTABLE_KEY: logFile.key,
      FILE_NAME: logFile.name,
      LINE_NUMBER: 34,
      LINE_HASH: 'some-hash-prvi'
    }

    logFile = faceTecLogFileNames.values[faceTecLogFileNames.keys.sorted[2]]

    // eslint-disable-next-line functional/immutable-data
    STATE.BLINKID_VERIFY_LAST_LOG_SENT = {
      FILE_SORTABLE_KEY: logFile.key,
      FILE_NAME: logFile.name,
      LINE_NUMBER: 58,
      LINE_HASH: 'some-hash-drugi-001'
    }

    state.save(STATE)

    console.log('STATE.after', STATE)

    // console.log('faceTecLogFileNames', faceTecLogFileNames)


    const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
      logs: [
        {
          verify: {
            blinkIdVerifyServerVersion: "Excepteur ad nisi ipsum laborum",
            processId: "enim aute Du",
            clientInstallationId: "occ",
            timestamp: 1621806135641,
            event: "ea veniam",
            eventData: "qui in eiusmod elit",
            verificationSession: "occaecat consectetur eiusmod in",
            face: "nulla occaecat incididunt",
            blinkId: {
              userId: "eiusmod sunt aliquip",
              sdkVersion: "aliqua cillum sunt adipisicing",
              sdkPlatform: "dolor ut fugiat in enim",
              osVersion: "os version 001",
              device: "ut Ut occaecat elit",
              licenseId: "tempor dolore exercitation",
              licensee: "ms-018",
              packageName: "adipis"
            },
            ref: 1621806135641,
            signature: "s"
          },
          facetec: {
            data: "stepanic 018"
          }
        }
      ]
    }

    const createLogsResult = await createLogs(licenseUsageLogsRequest)
    console.log('createLogsResult', createLogsResult)

  } catch(error) {
    console.error('top.level.error', error)
  }
})()


