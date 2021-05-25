/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/no-let */
/* eslint-disable functional/prefer-readonly-type */
import * as fs from 'fs'
import * as path from 'path'

import nexline from 'nexline'

import { Log } from "../model/license-usage-logs.model"


/**
 * Take BlinkID Verify Server log filename parse it to the structured object.
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
 *
 * @param logFileName is filename as as string
 * @returns object
 */
const parseBlinkIdVerifyLogFileName = (logFileName: string) => {

  const segments = logFileName.split('.')

  const name = segments[0]
  const parts = name.split('-')

  const date = parts[4]

  const id   = segments[1]
  const seq  = segments[2]

  const sortableKey  = `${date}.${seq}.${id}`

  return {
    id, date, seq, key: sortableKey, name: logFileName
  }

}

/**
 * Get sortable key from log filename
 * @param logFileName
 * @returns
 */
const getSortableKeyFromFileName = (logFileName: string) => {
  return parseBlinkIdVerifyLogFileName(logFileName)?.key
}

/**
 * Take list of BlinkID Verify Server log files filenames and parse them and sort them by sortable key (sort by creation date from the filename)
 * @param logFileNames are list of log files filenames
 * @returns object
 */
const parseBlinkIdVerifyLogFileNames = (logFileNames: readonly string[]) => {

  const logFilesKeys = []
  const logFiles = {}

  for (const logFileName of logFileNames) {

    const blinkIdVerifyLogFile = parseBlinkIdVerifyLogFileName(logFileName)

    // console.log('blinkIDVerifyLogFile', blinkIdVerifyLogFile)
    // console.log('')

    logFilesKeys.push(blinkIdVerifyLogFile.key)
    logFiles[blinkIdVerifyLogFile.key] = blinkIdVerifyLogFile
  }

  logFilesKeys.sort()

  return {
    keys: {
      sorted: logFilesKeys
    },
    values: logFiles,
  }
}

/**
 * Depends on the provided application state and license usage logs create log objects for sync to the service
 */
export const getBlinkIdVerifyLogsForSync = async (
  STATE: any,
  blinkIdVerifyLicenseUsageLogsDirPath: string
) => {

  /**
   * Read all BlinkID Verify License Usage Logs files from the persistent source
   */
  const logFileNames = fs.readdirSync(blinkIdVerifyLicenseUsageLogsDirPath)
  // console.log('logFileNames', logFileNames)

  /**
   * COnvert list of file paths to the structured objects
   */
  const blinkIdVerifyLogFileNames = parseBlinkIdVerifyLogFileNames(logFileNames)
  // console.log('blinkIdVerifyLogFileNames', blinkIdVerifyLogFileNames)

  /**
   * Logs batch holder for sync
   */
  const logsBatchForSync: Log[] = []

  let blinkIdVerifyLastLogSent: LicenseUsageLogsLastLogSent = null
  // Is valid persisted state? Try to restore.
  if (
    STATE.BLINKID_VERIFY_LAST_LOG_SENT?.FILE_NAME &&
    Number.isInteger(STATE.BLINKID_VERIFY_LAST_LOG_SENT?.LINE_NUMBER)
  ) {
    blinkIdVerifyLastLogSent = STATE.BLINKID_VERIFY_LAST_LOG_SENT
  }
  // Find next log for sync, seek to the file and line in a file
  for (const logFileSortableKey of blinkIdVerifyLogFileNames.keys.sorted) {
    // Is state was successfully restored and valid
    if (blinkIdVerifyLastLogSent !== null) {
      // Skip all files with lower creation date (they should be already synced)
      if (logFileSortableKey < getSortableKeyFromFileName(blinkIdVerifyLastLogSent.FILE_NAME)) {
        console.log('SKIP.alreadySynced.file', blinkIdVerifyLogFileNames.values[logFileSortableKey].name)
        /**
         * Better CLI UI with nice separator
         */
        console.log('----------------------------------------')
        console.log('')
        continue;
      }
    }

    // Get log file content
    const logFile = blinkIdVerifyLogFileNames.values[logFileSortableKey]

    const logFilePath = path.join(blinkIdVerifyLicenseUsageLogsDirPath, logFile.name)

    /**
     * Read line by line with nexline lib
     */
    const nl: any = nexline({
      input: fs.createReadStream(logFilePath),
    });

    /**
     * Init counters
     */
    let currentLineCounter = 0; // how many log lines read
    let syncedLineCounter = 0;  // how many log lines will be prepared for sync, sync set should be subset of visited log lines

    console.log('PREPARE.forSync.file', blinkIdVerifyLogFileNames.values[logFileSortableKey].name)

    // nexline is iterable
    for await (const line of nl) {
      // console.log(line);
      if (!line?.length) {
        continue;
      }
      currentLineCounter += 1

      // Try to seek in the last synced file, otherwise sync the whole file
      if (logFile.name === blinkIdVerifyLastLogSent?.FILE_NAME) {
        if (currentLineCounter <= blinkIdVerifyLastLogSent?.LINE_NUMBER) {
          continue;
        }
      }

      // Create log for sync
      syncedLineCounter += 1

      console.log(line)

      // Parse line to JSON and create log object
      let logObj = null
      try {
        logObj = JSON.parse(line)
        console.log(logObj)
      } catch (err) {
        console.error('blinkIdVerify.log.parse.error', err)
      }

      // Construct log object for sync
      const logForSync: Log = {
        verify: {
          blinkIdVerifyServerVersion: logObj?.blinkIdVerifyServerVersion,
          processId: logObj?.processId,
          clientInstallationId: logObj?.clientInstallationId,
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
        }
      }

      // Append log to the batch for sync
      logsBatchForSync.push(logForSync)
    }

    // console.log('faceTec.logFile.name', logFile.name)
    if (syncedLineCounter < currentLineCounter) {
      console.log('SKIP.alreadySynced.lines', blinkIdVerifyLastLogSent.LINE_NUMBER)
    }
    console.log('blinkIdVerify.lineCounter.forSync', syncedLineCounter, '/', currentLineCounter)

    // Update state
    STATE.BLINKID_VERIFY_LAST_LOG_SENT = {
      FILE_NAME: logFile.name,
      LINE_NUMBER: currentLineCounter
    }

    /**
     * Better CLI UI with nice separator
     */
    console.log('----------------------------------------')
    console.log('')

  }

  return []

}
