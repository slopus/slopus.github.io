/** A WebP's pixel width and height, read from its first chunk (lossy, lossless, or extended). */
export function webpSize(bytes: Uint8Array): [number, number] {
  const text = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end))
  if (text(0, 4) !== 'RIFF' || text(8, 12) !== 'WEBP') throw new Error('Not a WebP file')
  const u16 = (offset: number) => bytes[offset] | bytes[offset + 1] << 8
  const u24 = (offset: number) => u16(offset) | bytes[offset + 2] << 16
  const chunk = text(12, 16)
  if (chunk === 'VP8X') return [1 + u24(24), 1 + u24(27)]
  if (chunk === 'VP8 ') return [u16(26) & 0x3fff, u16(28) & 0x3fff]
  if (chunk === 'VP8L') {
    const bits = bytes[21] | bytes[22] << 8 | bytes[23] << 16 | bytes[24] << 24
    return [1 + (bits & 0x3fff), 1 + (bits >>> 14 & 0x3fff)]
  }
  throw new Error(`Unknown WebP chunk ${chunk}`)
}
