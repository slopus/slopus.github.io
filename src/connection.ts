export type DataConnection = EventTarget & { saveData?: boolean, effectiveType?: string }
export function dataConnection() {
  return (navigator as Navigator & { connection?: DataConnection }).connection
}
/** Save-Data, or a connection too slow for movies: the stills stay. */
export function sparing(connection: DataConnection | undefined = dataConnection()) {
  return Boolean(connection?.saveData) || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
}
