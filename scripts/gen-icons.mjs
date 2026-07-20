// 產生 PWA 圖示:藍繡球底、白色愛心。純 Node(zlib)手寫 PNG,不需任何依賴。
// 用法:node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const BG = [0x64, 0x89, 0xc2] // hydrangea-500
const FG = [0xff, 0xff, 0xff]

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

// 愛心隱函數:(x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
function inHeart(px, py, size) {
  const scale = 1.9
  const x = ((px / size) * 2 - 1) * scale
  const y = (1 - (py / size) * 2) * scale + 0.12
  const a = x * x + y * y - 1
  return a * a * a - x * x * y * y * y <= 0
}

function png(size) {
  const radius = size * 0.22 // 圓角
  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    for (let x = 0; x < size; x++) {
      // 圓角判斷
      const cx = Math.max(radius - x, x - (size - 1 - radius), 0)
      const cy = Math.max(radius - y, y - (size - 1 - radius), 0)
      const outside = cx * cx + cy * cy > radius * radius
      const [r, g, b] = inHeart(x, y, size) ? FG : BG
      const o = 1 + x * 4
      row[o] = r
      row[o + 1] = g
      row[o + 2] = b
      row[o + 3] = outside ? 0 : 255
    }
    rows.push(row)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public', { recursive: true })
for (const size of [180, 192, 512]) {
  writeFileSync(`public/icon-${size}.png`, png(size))
  console.log(`public/icon-${size}.png`)
}
