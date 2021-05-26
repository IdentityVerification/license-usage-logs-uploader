/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/no-let */
/* eslint-disable functional/prefer-readonly-type */
import * as fs from 'fs'
import * as path from 'path'

import moment from 'moment'
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
 * @param logFileDir is directory path of the log file
 * @param logFileName is filename as as string
 * @returns object
 */
const parseBlinkIdVerifyLogFileName = (logFileDir: string, logFileName: string) => {

  const segments = logFileName.split('.')

  const name = segments[0]
  const parts = name.split('-')

  const date = parts[4]

  const id   = segments[1]
  const seq  = segments[2]

  let sortableKey = ''
  try {
    const stat = fs.statSync(path.join(logFileDir, logFileName))

    // BUG
    // const sortableKey  = `${date}.${seq}.${id}`
    sortableKey  = `${stat.birthtimeMs}`
  } catch(err) {
    // console.error(err)
  }

  return {
    id, date, seq, key: sortableKey, name: logFileName
  }

}

/**
 * Get sortable key from log filename
 *
 * @param logFileDir
 * @param logFileName
 * @returns
 */
const getSortableKeyFromFileName = (logFileDir: string, logFileName: string) => {
  return parseBlinkIdVerifyLogFileName(logFileDir, logFileName)?.key
}

/**
 * Take list of BlinkID Verify Server log files filenames and parse them and sort them by sortable key (sort by creation date from the filename)
 *
 * @param logFilesDir is directory path of the log files
 * @param logFileNames are list of log files filenames
 * @returns object
 */
const parseBlinkIdVerifyLogFileNames = (logFilesDir: string, logFileNames: readonly string[]) => {

  const logFilesKeys = []
  const logFiles = {}

  for (const logFileName of logFileNames) {

    // console.log('logFileName', logFileName)

    const blinkIdVerifyLogFile = parseBlinkIdVerifyLogFileName(logFilesDir, logFileName)

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
  const blinkIdVerifyLogFileNames = parseBlinkIdVerifyLogFileNames(blinkIdVerifyLicenseUsageLogsDirPath, logFileNames)
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
      if (logFileSortableKey < getSortableKeyFromFileName(blinkIdVerifyLicenseUsageLogsDirPath, blinkIdVerifyLastLogSent.FILE_NAME)) {
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

      // console.log(line)

      // Parse line to JSON and create log object
      let logObj = null
      try {
        const logBoundaryStart = 'BIDVSLUL_' // short of: BlinkID Verify Server License Usage Log(s)
        const logBoundaryEnd   = '_LULSVDIB' // reverse of starting boundary
        logObj = JSON.parse(line.replace(logBoundaryStart, '').replace(logBoundaryEnd, ''))
        // console.log(logObj)
      } catch (err) {
        console.error('blinkIdVerify.log.parse.error', err)
      }

      try {

        // Construct log object for sync
        const logForSync: Log = {
          verify: {
            blinkIdVerifyServerVersion: logObj.serverVersion,
            processId: logObj.serverProcessId,
            clientInstallationId: logObj?.clientInstallationId,
            timestamp: moment(logObj?.timestamp)?.valueOf(),
            event: logObj.eventType,
            eventData: logObj?.eventData,
            verificationSession: logObj?.verificationSessionId,
            face: logObj?.face,
            blinkId: {
              userId: logObj?.blinkId?.userId,
              sdkVersion: logObj?.blinkId?.sdkVersion,
              sdkPlatform: logObj?.blinkId?.sdkPlatform,
              osVersion: logObj?.blinkId?.osVersion,
              device: logObj?.blinkId?.device,
              licenseId: logObj?.blinkId?.licenseId,
              licensee: logObj?.blinkId?.licensee,
              packageName: logObj?.blinkId?.packageName
            },
            ref: logObj?.ref ?? 0, // ref is null for first log in the log file, other logs are chained
            signature: logObj.signature
          }
        }

        // Append log to the batch for sync
        logsBatchForSync.push(logForSync)
      } catch(err) {
        console.error('Error with log line: ', line)
      }
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

  return logsBatchForSync

}
