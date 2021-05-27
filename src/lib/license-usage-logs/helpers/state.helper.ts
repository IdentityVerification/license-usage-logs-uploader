import fs from 'fs'

import * as store from './store.helper'

const STATE_DIR_PATH  = './state'
const STATE_FILE_PATH = STATE_DIR_PATH + '/state.json'

// ensure that state dir exists
if (!fs.existsSync(STATE_DIR_PATH)) {
  fs.mkdirSync(STATE_DIR_PATH)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const save = (state: any) => {
  store.write(STATE_FILE_PATH, state)
}

export const load = () => {
  return store.read(STATE_FILE_PATH)
}
