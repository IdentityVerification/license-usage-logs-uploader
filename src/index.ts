// export * from './lib/async';
// export * from './lib/number';

import { createLogs } from './lib/license-usage-logs/license-usage-logs-client'
import { LicenseUsageLogsRequestBody } from './lib/license-usage-logs/model/license-usage-logs.model'

(async () => {
  try {

    const licenseUsageLogsRequest: LicenseUsageLogsRequestBody = {
      logs: [
        {
          verify: {
            blinkIdVerifyServerVersion: "Excepteur ad nisi ipsum laborum",
            processId: "enim aute Du",
            clientInstallationId: "occ",
            timestamp: "in nisi irure anim",
            method: "ea veniam",
            methodResult: "qui in eiusmod elit",
            methodErrorReason: "anim Duis id culpa",
            verificationSession: "occaecat consectetur eiusmod in",
            faceComponent: "nulla occaecat incididunt",
            blinkId: {
              userId: "eiusmod sunt aliquip",
              sdkVersion: "aliqua cillum sunt adipisicing",
              sdkPlatform: "dolor ut fugiat in enim",
              osDevice: "ut Ut occaecat elit",
              licenseId: "tempor dolore exercitation",
              licensee: "ms-018",
              packageName: "adipis"
            },
            ref: "pariatur",
            signature: "s"
          },
          facetec: "stepanic 018"
        }
      ]
    }

    const createLogsResult = await createLogs(licenseUsageLogsRequest)
    console.log('createLogsResult', createLogsResult)

  } catch(error) {
    console.error('top.level.error', error)
  }
})()


