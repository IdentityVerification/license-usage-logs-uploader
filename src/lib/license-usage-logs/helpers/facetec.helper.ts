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
 * Take FaceTec Server log filename parse it to the structured object.
 *
 * Filename pattern:
 * `facetec-usage-$MACHINE_ID-$DATE.$SEQUENCE_ID.log`
 *
 * Examples:
 * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210521.00000.log`
 * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210522.00001.log`
 * `facetec-usage-00602eff4c693d1e35cb693f6889696d-20210523.00002.log`
 *
 * @param logFileDir is directory path of the log file
 * @param logFileName is filename as as string
 * @returns object
 */
const parseFaceTecLogFileName = (logFileDir: string, logFileName: string) => {

  const segments = logFileName.split('.')

  const name = segments[0]
  const parts = name.split('-')

  const id   = parts[2]
  const date = parts[3]
  const seq  = segments[1]

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
  return parseFaceTecLogFileName(logFileDir, logFileName)?.key
}

/**
 * Take list of FaceTec Server log files filenames and parse them and sort them by sortable key (sort by creation date from the filename)
 *
 * @param logFilesDir is directory path of the log files
 * @param logFileNames are list of log files filenames
 * @returns object
 */
const parseFaceTecLogFileNames = (logFilesDir: string, logFileNames: readonly string[]) => {

  const logFilesKeys = []
  const logFiles = {}

  for (const logFileName of logFileNames) {

    const faceTecLogFile = parseFaceTecLogFileName(logFilesDir, logFileName)

    // console.log('logFileName', logFileName)
    // console.log('faceTecLogFile', faceTecLogFile)
    // console.log('')

    logFilesKeys.push(faceTecLogFile.key)
    logFiles[faceTecLogFile.key] = faceTecLogFile
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
export const getFaceTecLogsForSync = async (
  STATE: any,
  facetecLicenseUsageLogsDirPath: string
) => {
  const logFileNames = fs.readdirSync(facetecLicenseUsageLogsDirPath)
  // console.log('logFileNames', logFileNames)

  const faceTecLogFileNames = parseFaceTecLogFileNames(facetecLicenseUsageLogsDirPath, logFileNames)
  // console.log('faceTecLogFileNames', faceTecLogFileNames)

  /**
   * Logs batch holder for sync
   */
  const logsBatchForSync: Log[] = []

  let facetecLastLogSent: LicenseUsageLogsLastLogSent = null
  // Is valid persisted state? Try to restore.
  if (
    STATE.FACETEC_LAST_LOG_SENT?.FILE_NAME &&
    Number.isInteger(STATE.FACETEC_LAST_LOG_SENT?.LINE_NUMBER)
  ) {
    facetecLastLogSent = STATE.FACETEC_LAST_LOG_SENT
  }
  // Find next log for sync, seek to the file and line in a file
  for (const logFileSortableKey of faceTecLogFileNames.keys.sorted) {
    // Is state was successfully restored and valid
    if (facetecLastLogSent !== null) {
      // Skip all files with lower creation date (they should be already synced)
      if (logFileSortableKey < getSortableKeyFromFileName(facetecLicenseUsageLogsDirPath, facetecLastLogSent.FILE_NAME)) {
        console.log('SKIP.alreadySynced.file', faceTecLogFileNames.values[logFileSortableKey].name)
        /**
         * Better CLI UI with nice separator
         */
        console.log('----------------------------------------')
        console.log('')
        continue;
      }
    }

    // Get log file content
    const logFile = faceTecLogFileNames.values[logFileSortableKey]

    const logFilePath = path.join(facetecLicenseUsageLogsDirPath, logFile.name)

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

    console.log('PREPARE.forSync.file', faceTecLogFileNames.values[logFileSortableKey].name)

    // nexline is iterable
    for await (const line of nl) {
      // console.log(line);
      if (!line?.length) {
        continue;
      }
      currentLineCounter += 1

      // Try to seek in the last synced file, otherwise sync the whole file
      if (logFile.name === facetecLastLogSent?.FILE_NAME) {
        if (currentLineCounter <= facetecLastLogSent?.LINE_NUMBER) {
          continue;
        }
      }

      // Create log for sync
      syncedLineCounter += 1

      // Construct log object for sync
      const logForSync: Log = {
        facetec: {
          // wrap RAW log line as encoded Base64 string
          data: Buffer.from(line).toString('base64')
        }
      }

      // Append log to the batch for sync
      logsBatchForSync.push(logForSync)

    }

    // console.log('faceTec.logFile.name', logFile.name)
    if (syncedLineCounter < currentLineCounter) {
      console.log('SKIP.alreadySynced.lines', facetecLastLogSent.LINE_NUMBER)
    }
    console.log('faceTec.lineCounter.forSync', syncedLineCounter, '/', currentLineCounter)

    // Update state
    STATE.FACETEC_LAST_LOG_SENT = {
      FILE_NAME: logFile.name,
      LINE_NUMBER: currentLineCounter
    }

    /**
     * Better CLI UI with nice separator
     */
    console.log('----------------------------------------')
    console.log('')

  }

  return logsBatchForSync;
}
