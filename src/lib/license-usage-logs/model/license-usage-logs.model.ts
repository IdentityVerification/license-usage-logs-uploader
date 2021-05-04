type BlinkId = {
    readonly userId: string;
    readonly sdkVersion: string;
    readonly sdkPlatform: string;
    readonly osDevice: string;
    readonly licenseId: string;
    readonly licensee: string;
    readonly packageName: string;
};

type Verify = {
    readonly blinkIdVerifyServerVersion: string;
    readonly processId: string;
    readonly clientInstallationId: string;
    readonly timestamp: string;
    readonly method: string;
    readonly methodResult: string;
    readonly methodErrorReason: string;
    readonly verificationSession: string;
    readonly faceComponent: string;
    readonly blinkId: BlinkId;
    readonly ref: string;
    readonly signature: string;
};

type Log = {
    readonly verify?: Verify;
    readonly facetec?: string;
};

export type LicenseUsageLogsRequestBody = {
    readonly logs: readonly Log[];
};

export type LicenseUsageResponseBody = {
  readonly status: number;
  readonly summary: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly data?: any;
}


