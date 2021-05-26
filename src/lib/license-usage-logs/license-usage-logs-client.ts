/* eslint-disable functional/no-let */
import { URL } from 'url'

import axios from 'axios'
import { AxiosRequestConfig } from 'axios'
import jsonSizeOf from 'json-sizeof'

import { LICENSE_USAGE_LOGS } from '../../config'

import { LicenseUsageLogsRequestBody, LicenseUsageResponseBody } from './model/license-usage-logs.model'

export const createLogs = async (body: LicenseUsageLogsRequestBody): Promise<LicenseUsageResponseBody> => {

  // console.log('logs', licenseUsageLogsRequest)

  let authorizationHeader = LICENSE_USAGE_LOGS.HEADERS.AUTHORIZATION
  // NOTE: at Microblink Developer Hub Authorization is visible without `Basic ` prefix and to avoid issues when users just
  // copy provided value and log uploader is not working this will prepend required prefix to construct Basic Auth header
  if (!authorizationHeader?.startsWith('Basic ')) {
    authorizationHeader = `Basic ${authorizationHeader}`
  }

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorizationHeader
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

    let summary = '🔴 Something went wrong during License Usage Logs creation!'
    if (status === 201) {
      summary = '🟢 License Usage Logs are successfully created.'
    }

    const data = response?.data

    return {
      status,
      summary,
      data
    }

  } catch (error) {
    // console.error('error', error)
    console.error('error.response.data', error?.response?.data)

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
