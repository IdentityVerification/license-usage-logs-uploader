// export * from './lib/async';
// export * from './lib/number';
import * as fs from 'fs'

import { parseFaceTecLogFileName, parseFaceTecLogFileNames } from './lib/license-usage-logs/helpers/facetec.helper'
import * as state from './lib/license-usage-logs/helpers/state.helper'
// import { createLogs } from './lib/license-usage-logs/license-usage-logs-client'
// import { LicenseUsageLogsRequestBody } from './lib/license-usage-logs/model/license-usage-logs.model'

(async () => {
  try {

    const facetecUsageLogsDirPath = '/Users/stepanic/git/microblink/facetec-standard-server/facetec-usage-logs'


    const STATE = state.load()

    console.log('STATE', STATE)

    const logFileNames = fs.readdirSync(facetecUsageLogsDirPath)

    const faceTecLogFileNames = parseFaceTecLogFileNames(logFileNames)

    // eslint-disable-next-line functional/no-let
    let logFile = faceTecLogFileNames.values[faceTecLogFileNames.keys.sorted[3]]

    // eslint-disable-next-line functional/immutable-data
    STATE.FACETEC_LAST_LOG_SENT = {
      FILE_SORTABLE_KEY: logFile.key,
      FILE_NAME: logFile.name,
      LINE_NUMBER: 34,
      LINE_HASH: 'some-hash-prvi'
    }

    logFile = faceTecLogFileNames.values[faceTecLogFileNames.keys.sorted[5]]

    // eslint-disable-next-line functional/immutable-data
    STATE.BLINKID_VERIFY_LAST_LOG_SENT = {
      FILE_SORTABLE_KEY: logFile.key,
      FILE_NAME: logFile.name,
      LINE_NUMBER: 57,
      LINE_HASH: 'some-hash-drugi'
    }

    // state.save(STATE)

    // console.log('faceTecLogFileNames', faceTecLogFileNames)


    // const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
    //   logs: [
    //     {
    //       verify: {
    //         blinkIdVerifyServerVersion: "Excepteur ad nisi ipsum laborum",
    //         processId: "enim aute Du",
    //         clientInstallationId: "occ",
    //         timestamp: "in nisi irure anim",
    //         method: "ea veniam",
    //         methodResult: "qui in eiusmod elit",
    //         methodErrorReason: "anim Duis id culpa",
    //         verificationSession: "occaecat consectetur eiusmod in",
    //         faceComponent: "nulla occaecat incididunt",
    //         blinkId: {
    //           userId: "eiusmod sunt aliquip",
    //           sdkVersion: "aliqua cillum sunt adipisicing",
    //           sdkPlatform: "dolor ut fugiat in enim",
    //           osDevice: "ut Ut occaecat elit",
    //           licenseId: "tempor dolore exercitation",
    //           licensee: "ms-018",
    //           packageName: "adipis"
    //         },
    //         ref: "pariatur",
    //         signature: "s"
    //       },
    //       facetec: "stepanic 018"
    //     }
    //   ]
    // }

    // const createLogsResult = await createLogs(licenseUsageLogsRequest)
    // console.log('createLogsResult', createLogsResult)

  } catch(error) {
    console.error('top.level.error', error)
  }
})()


