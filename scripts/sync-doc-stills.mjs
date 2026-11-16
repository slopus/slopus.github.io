// Takes the capture script's stills for whole pages: node scripts/sync-doc-stills.mjs <folder> <page>...
// (<folder> holds manifest.json and the AVIF files; a page is its path, such as /welcome/).
// A page switches whole (DESIGN.md, Screenshots): every picture on it comes from the folder, or none
// does, so the script refuses a page with a picture still marked "pending" or that the manifest's
// _pages block says is waiting on something, such as a clip. The other pages keep
// their entries and files. The manifest's presets come along for the tests.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [folder, ...pages] = process.argv.slice(2)
if (!folder || !pages.length) throw new Error('usage: node scripts/sync-doc-stills.mjs <folder> <page>...')
const source = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'))
const target = 'src/docStills.json'
const stills = JSON.parse(readFileSync(target, 'utf8'))

for (const page of pages) {
  const names = Object.keys(source).filter((name) => !name.startsWith('_') && source[name].page === page)
  if (!names.length) throw new Error(`${page}: no pictures in ${folder}`)
  const pending = names.filter((name) => source[name].pending)
  if (pending.length) throw new Error(`${page}: ${pending.join(', ')} still pending; the page switches whole`)
  const waiting = source._pages?.[page]?.waitingOn ?? []
  if (waiting.length) throw new Error(`${page}: waiting on ${waiting.join(', ')}; the page switches whole`)
  for (const name of names) {
    const entry = source[name]
    for (const cut of [entry.desktop, entry.phone].filter(Boolean)) {
      for (const file of Object.values(cut.files)) copyFileSync(join(folder, file), join('public/img/docs', file))
    }
    stills[name] = entry
    console.log(page, name)
  }
}
stills._presets = source._presets
writeFileSync(target, JSON.stringify(stills, null, 1) + '\n')
