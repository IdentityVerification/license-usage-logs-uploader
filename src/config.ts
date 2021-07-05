export const LICENSE_USAGE_LOGS = {
  BASE_URL: process.env.LICENSE_USAGE_LOGS_BASE_URL || 'https://license-usage-logs.microblink.com',
  HEADERS: {
    AUTHORIZATION: process.env.LICENSE_USAGE_LOGS_HEADERS_AUTHORIZATION
  },
  FACETEC: {
    DIR_PATH: process.env.LICENSE_USAGE_LOGS_FACETEC_DIR_PATH
  },
  BLINKID_VERIFY: {
    DIR_PATH: process.env.LICENSE_USAGE_LOGS_BLINKID_VERIFY_DIR_PATH
  },
  STATE: {
    DIR_PATH: process.env.LICENSE_USAGE_LOGS_STATE_DIR_PATH
  },
  /**
   * Archived log files will be skipped without opening and seeking for new log lines in them.
   */
  GREATER_THAN_HOW_MANY_SYNCS_UNCHANGED_LOG_FILE_IS_MARKED_AS_ARCHIVED: 100
}
