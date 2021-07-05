import fs from 'fs'

import { LICENSE_USAGE_LOGS } from '../../../config'

import * as store from './store.helper'

const STATE_DIR_PATH = LICENSE_USAGE_LOGS.STATE.DIR_PATH ?? './state'
const STATE_FILE_PATH = STATE_DIR_PATH + '/state.json'

// ensure that state dir exists
if (!fs.existsSync(STATE_DIR_PATH)) {
  console.log('mkdir ' + STATE_DIR_PATH)
  fs.mkdirSync(STATE_DIR_PATH)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const save = (state: any) => {
  store.write(STATE_FILE_PATH, state)
}

export const load = () => {
  console.log('store.read ' + STATE_FILE_PATH)
  return store.read(STATE_FILE_PATH)
}
