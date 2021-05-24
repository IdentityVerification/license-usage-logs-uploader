type LicenseUsageLogsLastLogSent = {
  /**
   * Filename of the last uploaded file in the log's directory
   */
   readonly FILE_NAME: string;

  /**
   * Last uploaded line to the log's service in file $FILE_NAME
   */
  readonly LINE_NUMBER: number;
}
