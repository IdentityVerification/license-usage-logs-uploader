/* eslint-disable functional/prefer-readonly-type */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable functional/no-let */
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

  let createdAt: number
  try {
    const stat = fs.statSync(path.join(logFileDir, logFileName))
    createdAt  = stat.birthtimeMs
  } catch(err) {
    // console.error(err)
    createdAt = 0
  }

  return {
    id, date, seq, createdAt, name: logFileName
  }

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
    logFilesKeys.push(faceTecLogFile.createdAt)
    logFiles[faceTecLogFile.createdAt] = faceTecLogFile
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

  let logFileNames = []
  try {
    /**
     * Read all FaceTec License Usage Logs files from the persistent source
     */
    logFileNames = fs.readdirSync(facetecLicenseUsageLogsDirPath)
  } catch(err) {
    console.log(`🟠 FaceTec License Usage Logs Directory ${facetecLicenseUsageLogsDirPath} not exist and sync is skipped.`)
    console.log()
    return logFileNames
  }

  /**
   * Get all available FaceTec Server license usage logs files
   */
  const faceTecLogFileNames = parseFaceTecLogFileNames(facetecLicenseUsageLogsDirPath, logFileNames)

  /**
   * Restore and init state if not defined
   */
  if (!STATE.FACETEC_LAST_LOGS_SENT) {
    STATE.FACETEC_LAST_LOGS_SENT = {}
  }
  const facetecLastLogsSent: LicenseUsageLogsLastLogsSent = STATE.FACETEC_LAST_LOGS_SENT

  /**
   * Logs batch holder for sync
   */
  const logsBatchForSync: Log[] = []

  // Find next log for sync, seek to the line in a file
  for (const logFileSortableKey of faceTecLogFileNames.keys.sorted) {

    // Get log file structure
    const logFileStructure = faceTecLogFileNames.values[logFileSortableKey]

    // Get log file state
    const logFileState = facetecLastLogsSent && facetecLastLogsSent[logFileStructure.name]

    // Get file path on disk
    const logFilePath = path.join(facetecLicenseUsageLogsDirPath, logFileStructure.name)

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
          continue
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

    } // end - iterating log file per line

    // console.log('faceTec.logFile.name', logFile.name)
    if (syncedLineCounter < currentLineCounter) {
      console.log('SKIP.alreadySynced.lines', logFileState?.FILE_LINE_NUMBER)
    }
    console.log('faceTec.lineCounter.forSync', syncedLineCounter, '/', currentLineCounter)

    // Update state
    STATE.FACETEC_LAST_LOGS_SENT[logFileStructure.name] = {
      FILE_NAME: logFileStructure.name,
      FILE_LINE_NUMBER: currentLineCounter,
      _FILE_CREATED_TIMESTAMP: parseFaceTecLogFileName(facetecLicenseUsageLogsDirPath, logFileStructure.name).createdAt,
      _FILE_LINES_IN_LAST_SYNC: syncedLineCounter,
    }

    /**
     * Better CLI UI with nice separator
     */
    console.log('----------------------------------------')
    console.log('')

  }

  return logsBatchForSync;
}
