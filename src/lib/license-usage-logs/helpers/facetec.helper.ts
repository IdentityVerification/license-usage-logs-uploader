export const parseFaceTecLogFileName = (logFileName: string) => {

  const segments = logFileName.split('.')

  const name = segments[0]
  const parts = name.split('-')

  const id   = parts[2]
  const date = parts[3]
  const seq  = segments[1]

  const sortableKey  = `${date}.${seq}.${id}`

  return {
    id, date, seq, key: sortableKey, name: logFileName
  }

}

export const parseFaceTecLogFileNames = (logFileNames: readonly string[]) => {

  const logFilesKeys = []
  const logFiles = {}

  // eslint-disable-next-line functional/no-loop-statement
  for (const logFileName of logFileNames) {

    const faceTecLogFile = parseFaceTecLogFileName(logFileName)

    // console.log('logFileName', logFileName)
    // console.log('faceTecLogFile', faceTecLogFile)
    // console.log('')

    // eslint-disable-next-line functional/immutable-data
    logFilesKeys.push(faceTecLogFile.key)
    // eslint-disable-next-line functional/immutable-data
    logFiles[faceTecLogFile.key] = faceTecLogFile
  }

  // eslint-disable-next-line functional/immutable-data
  logFilesKeys.sort()

  return {
    keys: {
      sorted: logFilesKeys
    },
    values: logFiles,
  }
}
