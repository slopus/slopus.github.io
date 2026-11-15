/**
 * An MP4's video track from its header: its frame size, the timescale, and the stts runs of
 * [frame count, frame duration].
 */
export function mp4VideoTiming(bytes: Uint8Array): { width: number; height: number; timescale: number; runs: [number, number][] } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const type = (offset: number) => String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
  // Each child box of [start, end) as its type and the bounds of its contents.
  const children = (start: number, end: number) => {
    const found: { type: string; start: number; end: number }[] = []
    for (let offset = start; offset + 8 <= end;) {
      let size = view.getUint32(offset)
      let header = 8
      if (size === 1) { size = Number(view.getBigUint64(offset + 8)); header = 16 }
      if (size === 0) size = end - offset
      found.push({ type: type(offset), start: offset + header, end: offset + size })
      offset += size
    }
    return found
  }
  const child = (box: { start: number; end: number }, ...path: string[]) =>
    path.reduce<{ start: number; end: number } | undefined>((parent, name) => parent && children(parent.start, parent.end).find((box) => box.type === name), box)

  const moov = children(0, bytes.byteLength).find((box) => box.type === 'moov')
  for (const trak of moov ? children(moov.start, moov.end).filter((box) => box.type === 'trak') : []) {
    const hdlr = child(trak, 'mdia', 'hdlr')
    if (!hdlr || String.fromCharCode(...bytes.subarray(hdlr.start + 8, hdlr.start + 12)) !== 'vide') continue
    const mdhd = child(trak, 'mdia', 'mdhd')!
    const timescale = view.getUint32(mdhd.start + (bytes[mdhd.start] === 1 ? 20 : 12))
    // The first sample entry (avc1, hvc1…) of stsd: its width and height follow 24 bytes of fields.
    const entry = child(trak, 'mdia', 'minf', 'stbl', 'stsd')!.start + 8 + 8
    const [width, height] = [view.getUint16(entry + 24), view.getUint16(entry + 26)]
    const stts = child(trak, 'mdia', 'minf', 'stbl', 'stts')!
    const runs: [number, number][] = []
    for (let index = 0; index < view.getUint32(stts.start + 4); index++) {
      runs.push([view.getUint32(stts.start + 8 + index * 8), view.getUint32(stts.start + 12 + index * 8)])
    }
    return { width, height, timescale, runs }
  }
  throw new Error('No video track')
}
