// Takes the capture script's stills and clips for whole pages: node scripts/sync-doc-stills.mjs <folder> <page>...
// (<folder> holds manifest.json and the AVIF files, and clips/ the clip manifest, its MP4s and their
// first and rest stills; a page is its path, such as /welcome/).
// A page switches whole (DESIGN.md, Screenshots): every picture on it comes from the folder, or none
// does, so the script refuses a page with a picture still marked "pending" or that the manifest's
// _pages block says is waiting on something, such as a clip. A still a clip replaces keeps its
// entry and loses its files: the page shows the clip's own first and rest stills. The other pages
// keep their entries and files. The manifest's presets come along for the tests.
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [folder, ...pages] = process.argv.slice(2)
if (!folder || !pages.length) throw new Error('usage: node scripts/sync-doc-stills.mjs <folder> <page>...')
const source = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'))
const clipSource = existsSync(join(folder, 'clips/manifest.json')) ? JSON.parse(readFileSync(join(folder, 'clips/manifest.json'), 'utf8')).clips : {}
const [stillsFile, clipsFile] = ['src/docStills.json', 'src/docClips.json']
const stills = JSON.parse(readFileSync(stillsFile, 'utf8'))
const clips = JSON.parse(readFileSync(clipsFile, 'utf8'))
const cuts = (entry) => [entry.desktop, entry.phone].filter(Boolean)

for (const page of pages) {
  const names = Object.keys(source).filter((name) => !name.startsWith('_') && source[name].page === page)
  if (!names.length) throw new Error(`${page}: no pictures in ${folder}`)
  const pending = names.filter((name) => source[name].pending)
  if (pending.length) throw new Error(`${page}: ${pending.join(', ')} still pending; the page switches whole`)
  const waiting = source._pages?.[page]?.waitingOn ?? []
  if (waiting.length) throw new Error(`${page}: waiting on ${waiting.join(', ')}; the page switches whole`)
  // A clip this repo plays on the page must come with it.
  const pageClips = Object.keys(clipSource).filter((name) => clipSource[name].page === page)
  const missing = Object.keys(clips).filter((name) => clips[name].page === page && !pageClips.includes(name))
  if (missing.length) throw new Error(`${page}: ${missing.join(', ')} plays here and has no clip in ${folder}/clips`)
  for (const name of pageClips) {
    const entry = clipSource[name]
    for (const cut of cuts(entry)) for (const files of Object.values(cut.files)) {
      copyFileSync(join(folder, 'clips', files.clip), join('public/video/docs', files.clip))
      for (const still of [files.first, files.rest]) copyFileSync(join(folder, 'clips', still), join('public/img/docs', still))
    }
    clips[name] = entry
    console.log(page, name, '(clip)')
  }
  for (const name of names) {
    const entry = source[name]
    const replaced = Boolean(clips[name])
    for (const cut of cuts(entry)) for (const file of Object.values(cut.files)) {
      if (replaced) rmSync(join('public/img/docs', file), { force: true })
      else copyFileSync(join(folder, file), join('public/img/docs', file))
    }
    stills[name] = entry
    console.log(page, name, replaced ? '(its clip plays instead)' : '')
  }
}
stills._presets = source._presets
writeFileSync(stillsFile, JSON.stringify(stills, null, 1) + '\n')
writeFileSync(clipsFile, JSON.stringify(clips, null, 1) + '\n')
