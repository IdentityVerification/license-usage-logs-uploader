export const LICENSE_USAGE_LOGS = {
  BASE_URL: process.env.LICENSE_USAGE_LOGS_BASE_URL || 'https://license-usage-logs.dev.microblink.com',
  HEADERS: {
    AUTHORIZATION: process.env.LICENSE_USAGE_LOGS_HEADERS_AUTHORIZATION
  },
  FACETEC: {
    DIR_PATH: process.env.LICENSE_USAGE_LOGS_FACETECT_DIR_PATH
  },
  BLINKID_VERIFY: {
    DIR_PATH: process.env.LICENSE_USAGE_LOGS_BLINKID_VERIFY_DIR_PATH
  }
}
