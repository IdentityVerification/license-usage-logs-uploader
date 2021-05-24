import { LICENSE_USAGE_LOGS } from "../../config"

import { getFaceTecLogsForSync } from "./helpers/facetec.helper"
import * as state from './helpers/state.helper'
import { createLogs } from "./license-usage-logs-client"
import { LicenseUsageLogsRequestBody } from "./model/license-usage-logs.model"

/**
 * Sync local license usage logs from the files to the service
 */
export const syncLicenseUsageLogs = async (

) => {
  /**
     * Absolute path to the BlinkID Verify Server License Usage Logs
     *
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
   const blinkIdVerifyLicenseUsageLogsDirPath = LICENSE_USAGE_LOGS.BLINKID_VERIFY.DIR_PATH

   /**
    * Absolute path to the FaceTec Server License Usage Logs
    *
    * Filename pattern:
    * `facetec-usage-$MACHINE_ID-$DATE.$SEQUENCE_ID.log`
    *
    * Examples:
    * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210521.00000.log`
    * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210522.00001.log`
    * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210523.00002.log`
    *
    */
   const facetecLicenseUsageLogsDirPath = LICENSE_USAGE_LOGS.FACETEC.DIR_PATH


   /**
    * To correctly continue license usage logs uploading to the server, load application persistent state from the file.
    * Application state has information about last file uploaded file to the server and last uploaded line from that file.
    * Every line is one log entity.
    */
   const STATE = state.load()
   console.log('STATE.before', STATE)
   console.log('----------------------------------------')
   console.log('')

   /**
    * Get all FaceTec logs for sync with log's service
    */
   const faceTecLogsBatchForSync = await getFaceTecLogsForSync(STATE, facetecLicenseUsageLogsDirPath)


   /**
    * Sync to the log's service
    */
   console.log('TOTAL.faceTectLogs.forSync')
   console.log('faceTecLogsBatchForSync.length', faceTecLogsBatchForSync.length)
   /**
    * Better CLI UI with nice separator
    */
    console.log('----------------------------------------')
    console.log('')


   // STATE.BLINKID_VERIFY_LAST_LOG_SENT = {
   //   FILE_NAME: logFile.name,
   //   FILE_SORTABLE_KEY: logFile.key,
   //   LINE_NUMBER: 58
   // }

   const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
     logs: faceTecLogsBatchForSync
   }

   const createLogsResult = await createLogs(licenseUsageLogsRequest)
   console.log('createLogsResult', createLogsResult)
   console.log('----------------------------------------')
   console.log('')


   /**
    * Store (persist) application state to the file for the next script run which will restore this state from the file.
    */
   state.save(STATE)
   console.log('STATE.after', STATE)
   console.log('----------------------------------------')
   console.log('')

   // console.log('faceTecLogFileNames', faceTecLogFileNames)


   // const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
   //   logs: [
   //     {
   //       verify: {
   //         blinkIdVerifyServerVersion: "Excepteur ad nisi ipsum laborum",
   //         processId: "enim aute Du",
   //         clientInstallationId: "occ",
   //         timestamp: 1621806135641,
   //         event: "ea veniam",
   //         eventData: "qui in eiusmod elit",
   //         verificationSession: "occaecat consectetur eiusmod in",
   //         face: "nulla occaecat incididunt",
   //         blinkId: {
   //           userId: "eiusmod sunt aliquip",
   //           sdkVersion: "aliqua cillum sunt adipisicing",
   //           sdkPlatform: "dolor ut fugiat in enim",
   //           osVersion: "os version 001",
   //           device: "ut Ut occaecat elit",
   //           licenseId: "tempor dolore exercitation",
   //           licensee: "ms-018",
   //           packageName: "adipis"
   //         },
   //         ref: 1621806135641,
   //         signature: "s"
   //       },
   //       facetec: {
   //         data: "stepanic 018"
   //       }
   //     }
   //   ]
   // }
}
