function makeCRCTable () {
  let c
  let crcTable = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1
    }
    crcTable[n] = c
  }
  return crcTable
}

const crcTable = makeCRCTable()

export default function crc32 (str) {
  let crc = 0 ^ -1
  for (let i = 0; i < str.length; i++) {
    crc = crc >>> 8 ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

export const HASH_LENGTH = Math.pow(2, 20) - 1

export function getHash (str) {
  return crc32(str) & HASH_LENGTH
}
