import { LICENSE_USAGE_LOGS } from "../../config"

import { getBlinkIdVerifyLogsForSync } from "./helpers/blinkid-verify.helper"
import { getFaceTecLogsForSync } from "./helpers/facetec.helper"
import * as state from './helpers/state.helper'
import { createLogs } from "./license-usage-logs-client"
import { LicenseUsageLogsRequestBody } from "./model/license-usage-logs.model"

/**
 * Sync local license usage logs from the files to the service
 */
export const syncLicenseUsageLogs = async (
  syncId: number
) => {
  console.log('----------------------------------------------')
  console.log('MICROBLINK_LICENSE_USAGE_LOGS_UPLOADER_STARTED - syncId = ' + syncId)
  console.log('----------------------------------------------')
  console.log('')

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
  if (!blinkIdVerifyLicenseUsageLogsDirPath) {
    console.error('LICENSE_USAGE_LOGS.BLINKID_VERIFY.DIR_PATH is required to be defined!')
    return 1
  }

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
  if (!facetecLicenseUsageLogsDirPath) {
    console.error('LICENSE_USAGE_LOGS.FACETEC.DIR_PATH is required to be defined!')
    return 1
  }

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
   * Get all BlinkID Verify and FaceTec logs for sync with log's service
   */
  const faceTecLogsBatchForSync = await getFaceTecLogsForSync(STATE, facetecLicenseUsageLogsDirPath)
  const blinkIdVerifyLogsBatchForSync = await getBlinkIdVerifyLogsForSync(STATE, blinkIdVerifyLicenseUsageLogsDirPath)

  /**
   * Sync to the log's service
   */
  console.log('TOTAL.blinkIdVerifyLogs.forSync')
  console.log('blinkIdVerifyLogsBatchForSync.length', blinkIdVerifyLogsBatchForSync.length)
  console.log('TOTAL.faceTecLogs.forSync')
  console.log('faceTecLogsBatchForSync.length', faceTecLogsBatchForSync.length)
  /**
   * Better CLI UI with nice separator
   */
  console.log('----------------------------------------')
  console.log('')

  /**
   * Construct request body
   */
  const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
    logs: [ ...blinkIdVerifyLogsBatchForSync, ...faceTecLogsBatchForSync ]
  }

  /**
   * Show result from the log's service API
   */
  if (licenseUsageLogsRequest?.logs?.length) {
    const createLogsResult = await createLogs(licenseUsageLogsRequest)
    console.log('createLogsResult', createLogsResult)

    if (createLogsResult.status === 201) {

      /**
       * Store (persist) application state to the file for the next script run which will restore this state from the file.
       */
      state.save(STATE)
      console.log('STATE.after', STATE)
      console.log('----------------------------------------')
      console.log('')
    }
  } else {
    console.log('🟠 License Usage Logs Sync skipped because everything is up-to-date.')
  }
  console.log('----------------------------------------')
  console.log('')


  console.log('-----------------------------------------------')
  console.log('MICROBLINK_LICENSE_USAGE_LOGS_UPLOADER_FINISHED - syncId = ' + syncId)
  console.log('-----------------------------------------------')
}
