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

/** An AVIF's pixel width and height: the first image spatial extents (`ispe`) in meta → iprp → ipco. */
export function avifSize(bytes: Uint8Array): [number, number] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const type = (offset: number) => String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
  if (type(0) !== 'ftyp' || !['avif', 'avis'].includes(String.fromCharCode(...bytes.subarray(8, 12)))) throw new Error('Not an AVIF file')
  // The boxes from start to end; `meta` is a full box, its children start after 4 bytes of version and flags.
  function find(start: number, end: number, path: string[]): number {
    for (let offset = start; offset + 8 <= end;) {
      const size = view.getUint32(offset)
      if (size < 8) break
      if (type(offset) === path[0]) {
        if (path.length === 1) return offset
        const body = offset + 8 + (path[0] === 'meta' ? 4 : 0)
        return find(body, offset + size, path.slice(1))
      }
      offset += size
    }
    throw new Error(`No ${path[0]} box in the AVIF file`)
  }
  const ispe = find(0, bytes.length, ['meta', 'iprp', 'ipco', 'ispe'])
  return [view.getUint32(ispe + 12), view.getUint32(ispe + 16)]
}

/** A WebP's or AVIF's pixel width and height. */
export function imageSize(bytes: Uint8Array): [number, number] {
  return String.fromCharCode(...bytes.subarray(4, 8)) === 'ftyp' ? avifSize(bytes) : webpSize(bytes)
}
