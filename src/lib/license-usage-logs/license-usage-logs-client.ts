import { URL } from 'url'

import axios from 'axios'
import { AxiosRequestConfig } from 'axios'
import jsonSizeOf from 'json-sizeof'

import { LICENSE_USAGE_LOGS } from '../../config'

import { LicenseUsageLogsRequestBody, LicenseUsageResponseBody } from './model/license-usage-logs.model'

export const createLogs = async (body: LicenseUsageLogsRequestBody): Promise<LicenseUsageResponseBody> => {

  // console.log('logs', licenseUsageLogsRequest)

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': LICENSE_USAGE_LOGS.HEADERS.AUTHORIZATION
    }
  };

  // console.log('config:AxiosRequestConfig', config)

  try {
    const url = new URL('/api/v1/log', LICENSE_USAGE_LOGS.BASE_URL)
    // console.log('url', url)

    const bodySize = jsonSizeOf(body)
    console.log('TOTAL.createLogs.body.size', bodySize, 'bytes')
    console.log('----------------------------------------')
    console.log('')

    const response = await axios.post(url.href, body, config)
    // console.log('response', response)

    const status = response?.status
    // console.log('response.status', status)

    // eslint-disable-next-line functional/no-let
    let summary = 'Something went wrong during license usage logs creation!'
    if (status === 201) {
      summary = 'License Usage Logs are successfully created.'
    }

    const data = response?.data

    return {
      status,
      summary,
      data
    }

  } catch (error) {
    console.error('error', error)

    const status = error?.response?.status
    console.log('error.status', status)

    const summary = 'Error during logs creation :('

    return {
      status,
      summary,
      data: error?.response?.data
    }

  }

}
