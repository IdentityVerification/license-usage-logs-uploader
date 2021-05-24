/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-loop-statement */
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

    console.log('blinkIDVerifyLogFile', blinkIdVerifyLogFile)
    console.log('')

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



   // STATE.BLINKID_VERIFY_LAST_LOG_SENT = {
   //   FILE_NAME: logFile.name,
   //   LINE_NUMBER: 58
   // }


  return []

}
