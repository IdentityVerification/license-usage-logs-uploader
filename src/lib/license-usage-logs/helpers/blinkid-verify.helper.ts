/* eslint-disable functional/prefer-readonly-type */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable functional/no-let */
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

  const id = segments[1]
  const seq = segments[2]

  let createdAt: number
  try {
    const stat = fs.statSync(path.join(logFileDir, logFileName))
    createdAt = stat.birthtimeMs || stat.ctimeMs
  } catch (err) {
    // console.error('parseBlinkIdVerifyLogFileName', err)
    createdAt = 0
  }

  return {
    id, date, seq, createdAt, name: logFileName
  }

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
    const blinkIdVerifyLogFile = parseBlinkIdVerifyLogFileName(logFilesDir, logFileName)
    logFilesKeys.push(blinkIdVerifyLogFile.createdAt)
    logFiles[blinkIdVerifyLogFile.createdAt] = blinkIdVerifyLogFile
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

  let logFileNames = []
  try {
    /**
     * Read all BlinkID Verify License Usage Logs files from the persistent source
     */
    logFileNames = fs.readdirSync(blinkIdVerifyLicenseUsageLogsDirPath)
    // console.log('logFileNames', logFileNames)
  } catch (err) {
    console.log(`🟠 BlinkID Verify Server License Usage Logs Directory ${blinkIdVerifyLicenseUsageLogsDirPath} not exist and sync is skipped.`)
    console.log()
    return logFileNames
  }

  /**
   * Convert list of file paths to the structured objects
   */
  const blinkIdVerifyLogFileNames = parseBlinkIdVerifyLogFileNames(blinkIdVerifyLicenseUsageLogsDirPath, logFileNames)

  /**
   * Restore and init state if not defined
   */
  if (!STATE.BLINKID_VERIFY_LAST_LOGS_SENT) {
    STATE.BLINKID_VERIFY_LAST_LOGS_SENT = {}
  }
  const blinkIdVerifyLastLogsSent: LicenseUsageLogsLastLogsSent = STATE.BLINKID_VERIFY_LAST_LOGS_SENT

  /**
   * Logs batch holder for sync
   */
  const logsBatchForSync: Log[] = []

  // Find next log for sync, seek to the file and line in a file
  for (const logFileSortableKey of blinkIdVerifyLogFileNames.keys.sorted) {

    // Get log file structure
    const logFileStructure = blinkIdVerifyLogFileNames.values[logFileSortableKey]

    // Get log file state
    const logFileState = blinkIdVerifyLastLogsSent && blinkIdVerifyLastLogsSent[logFileStructure.name]

    // Get file path on disk
    const logFilePath = path.join(blinkIdVerifyLicenseUsageLogsDirPath, logFileStructure.name)

    try {

      // Get file info
      const stat = fs.lstatSync(logFilePath)

      if (stat.isFile()) {

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

          /**
           * Skip empty lines
           */
          if (!line?.length) {
            continue;
          }
          /**
           * Counter of the current line
           */
          currentLineCounter += 1

          // Try to seek in the already synced file, otherwise sync the whole file
          if (logFileStructure.name === logFileState?.FILE_NAME) {
            if (currentLineCounter <= logFileState?.FILE_LINE_NUMBER) {
              continue;
            }
          }

          // Create log for sync
          syncedLineCounter += 1

          // Parse line to JSON and create log object
          let logObj = null
          try {
            const logBoundaryStart = 'BIDVSLUL_' // short of: BlinkID Verify Server License Usage Log(s)
            const logBoundaryEnd = '_LULSVDIB' // reverse of starting boundary
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
          } catch (err) {
            console.error('Error with log line: ', line)
          }
        }

        console.log('DONE.sync.file', blinkIdVerifyLogFileNames.values[logFileSortableKey].name)

        // console.log('faceTec.logFile.name', logFile.name)
        if (syncedLineCounter < currentLineCounter) {
          console.log('SKIP.alreadySynced.lines', logFileState.FILE_LINE_NUMBER)
        }
        console.log('blinkIdVerify.lineCounter.forSync', syncedLineCounter, '/', currentLineCounter)

        // Update state
        STATE.BLINKID_VERIFY_LAST_LOGS_SENT[logFileStructure.name] = {
          FILE_NAME: logFileStructure.name,
          FILE_LINE_NUMBER: currentLineCounter,
          _FILE_CREATED_TIMESTAMP: parseBlinkIdVerifyLogFileName(blinkIdVerifyLicenseUsageLogsDirPath, logFileStructure.name).createdAt,
          _FILE_LINES_IN_LAST_SYNC: syncedLineCounter,
        }

      }

    } catch (error) {
      console.error('PREPARE.forSync.blinkid-verify.error', error)
    }

    /**
     * Better CLI UI with nice separator
     */
    console.log('----------------------------------------')
    console.log('')

  }

  return logsBatchForSync
}
