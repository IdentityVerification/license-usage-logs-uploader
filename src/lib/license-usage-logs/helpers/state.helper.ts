import * as store from './store.helper'

const STATE_FILE_PATH = 'state.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const save = (state: any) => {
  store.write(STATE_FILE_PATH, state)
}

export const load = () => {
  return store.read(STATE_FILE_PATH)
}
