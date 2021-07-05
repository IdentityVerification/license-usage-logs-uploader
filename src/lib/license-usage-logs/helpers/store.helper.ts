import * as fs from 'fs'

export const read = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return {}
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch (error) {
    if (error.message === 'Unexpected end of JSON input') {
      return {}
    }
    console.error('store.read.error', error)
  }
  return {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const write = (filePath: string, data: any) => {
  try {
    // console.log('store.write.before', filePath, data)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    // console.log('store.write.after', filePath, data)
  } catch (error) {
    console.error('store.write.error', error)
  }
}
