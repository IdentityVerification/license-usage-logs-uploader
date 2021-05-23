type BlinkId = {
    readonly userId: string;
    readonly sdkVersion: string;
    readonly sdkPlatform: string;
    readonly osVersion: string;
    readonly device: string;
    readonly licenseId: string;
    readonly licensee: string;
    readonly packageName: string;
};

type Verify = {
    readonly blinkIdVerifyServerVersion: string;
    readonly processId: string;
    readonly clientInstallationId: string;
    readonly timestamp: number;
    readonly event: string;
    readonly eventData: string;
    readonly verificationSession: string;
    readonly face: string;
    readonly blinkId: BlinkId;
    readonly ref: number;
    readonly signature: string;
};

type FaceTec = {
    readonly data: string;
}

type Log = {
    readonly verify?: Verify;
    readonly facetec?: FaceTec;
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


