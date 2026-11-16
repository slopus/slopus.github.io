import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import docCaptures from 'virtual:doc-captures'
import { DOC_CLIPS } from './DocClip'
import { cutCss, DOC_STILL_PRESETS, DOC_STILLS, isFramed } from './DocStill'
import { documentsForProduct, getDocument } from './documents'
import { mp4VideoTiming } from './mp4Timing'
import { imageSize, webpSize } from './imageSize'

/** The docs text column on a desktop: 760px less its 2rem of right padding (src/style.css). */
const COLUMN = 728

function markdownFiles(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name))
    .map((entry) => `${entry.parentPath}/${entry.name}`)
}

// Every image of a docs capture, with its title: "window" and "window chrome" are the whole-window
// shot, "row" a phone, each at its one fixed scale; everything else is shown at half its pixels.
const uses = markdownFiles('content').flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/!\[[^\]]*\]\((\/img\/docs\/[^\s)]+\.webp)(?: "([^"]*)")?\)/g)]
    .map(([, src, title]) => ({ file, src, title })))

describe('docs captures (DESIGN.md, Screenshots, rule 2)', () => {
  it('reads every capture\'s size from its file', () => {
    for (const file of readdirSync('public/img/docs').filter((name) => /\.(webp|avif)$/.test(name))) {
      expect(docCaptures[`/img/docs/${file}`]).toEqual(imageSize(readFileSync(`public/img/docs/${file}`)))
    }
  })

  it('shows each capture at half its pixels, inside the column', () => {
    expect(uses.length).toBeGreaterThan(0)
    for (const { file, src, title } of uses) {
      const size = docCaptures[src]
      expect(size, `${file}: ${src} is missing`).toBeDefined()
      if (title === 'window' || title === 'window chrome') continue
      const [width, height] = size
      if (title === 'row') {
        expect(width, `${file}: phone ${src} is 544px wide (272 at 2x)`).toBe(544)
        continue
      }
      expect(width % 2 === 0 && height % 2 === 0, `${file}: ${src} is ${width}×${height}, not a 2x capture`).toBe(true)
      expect(width / 2, `${file}: ${src} is ${width / 2}px wide at its true size, wider than the ${COLUMN}px column; recapture it narrower`).toBeLessThanOrEqual(COLUMN)
    }
  })
})

// The reading path's clips: <folder>clip.mp4 (src/AutoplayClip.tsx), and the stills that play
// (src/DocClip.tsx), every cut in both schemes. Repeated frames need a decoder, so only the frame
// rate is checked here.
const READING_PATH = ['Start here', 'Your team', 'The app', 'Where this goes']
const clipCuts = Object.entries(DOC_CLIPS).flatMap(([name, clip]) => (['desktop', 'phone'] as const)
  .flatMap((kind) => { const cut = clip[kind]; return cut ? (['light', 'dark'] as const).map((scheme) => ({ name: `${name} ${kind} ${scheme}`, page: clip.page, cut, files: cut.files[scheme] })) : [] }))
const clips = [
  ...documentsForProduct('desktop').filter((document) => READING_PATH.includes(document.group))
    .flatMap((document) => [...readFileSync(document.sourcePath.slice(1), 'utf8').matchAll(/!\[[^\]]*\]\((\/[^\s)]+\/) "autoplay"\)/g)]
      .map(([, folder]) => ({ path: document.path, file: `public${folder}clip.mp4` }))),
  ...clipCuts.map(({ page, files }) => ({ path: page.replace(/^\/|\/$/g, ''), file: `public/video/docs/${files.clip}` })),
]

describe('docs clips (DESIGN.md, Screenshots, rule 6a)', () => {
  it('play at a constant 60 frames per second', () => {
    expect(clips.length).toBeGreaterThan(0)
    for (const { path, file } of clips) {
      const { timescale, runs } = mp4VideoTiming(readFileSync(file))
      // Every frame but possibly the last lasts 1/60 s.
      const durations = new Set(runs.slice(0, runs.at(-1)?.[0] === 1 ? -1 : undefined).map(([, duration]) => duration))
      expect([...durations].map((duration) => timescale / duration), `/${path}/: ${file}`).toEqual([60])
    }
  })

  // Its still is its own frame 0 (rule 11): same size here; the pixels are checked in a browser
  // when the still is made (DESIGN.md, Screenshots).
  it('rest on a still the size of their frames', () => {
    for (const { path, file } of clips.filter(({ file }) => file.endsWith('/clip.mp4'))) {
      const { width, height } = mp4VideoTiming(readFileSync(file))
      expect(webpSize(readFileSync(file.replace(/clip\.mp4$/, 'poster.webp'))), `/${path}/: ${file}`).toEqual([width, height])
    }
  })
})

// A still that plays (src/DocClip.tsx) opens on the clip's first frame and rests on its last, both
// the clip's size (rule 11); the pixels are checked in a browser when they are made.
describe('docs stills that play (DESIGN.md, Screenshots, rules 2, 6 and 11)', () => {
  it('come as a clip and its first and last frames, 2x at their display size, hanging from the column', () => {
    expect(clipCuts.length).toBeGreaterThan(0)
    for (const { name, cut, files } of clipCuts) {
      const { width, height } = mp4VideoTiming(readFileSync(`public/video/docs/${files.clip}`))
      expect([width, height], `${name}: ${files.clip}`).toEqual(cut.pixels)
      for (const still of [files.first, files.rest]) expect(docCaptures[`/img/docs/${still}`], `${name}: ${still}`).toEqual(cut.pixels)
      expect([cut.displayWidth * 2, cut.displayHeight * 2], name).toEqual(cut.pixels)
      const scale = cut.scale ?? 1
      expect([Math.round(cut.crop[2] * scale), Math.round(cut.crop[3] * scale)], `${name}: the crop at its scale is the display size`).toEqual([cut.displayWidth, cut.displayHeight])
      expect([cut.at, cut.inset], name).toEqual(['left', 0])
      const column = name.includes(' desktop ') ? COLUMN : 350
      expect(cut.overhang, `${name}: runs ${cut.displayWidth - column}px past the ${column}px column`).toBe(Math.max(0, cut.displayWidth - column))
    }
  })

  it('replace the still of the same name, in its place', () => {
    for (const [name, clip] of Object.entries(DOC_CLIPS)) {
      expect(clip.replaces, name).toBe(name)
      expect([clip.page, clip.section], name).toEqual([DOC_STILLS[name]?.page, DOC_STILLS[name]?.section])
    }
  })
})

// Stills come with the capture script's manifest (src/docStills.json): its sizes, not the column, decide.
describe('docs stills (DESIGN.md, Screenshots, rule 2)', () => {
  it('match their manifest: files exactly twice their display size, hanging from the column by their overhang', () => {
    for (const [name, still] of Object.entries(DOC_STILLS)) {
      // A still that plays shows the clip's own stills instead (above).
      if (DOC_CLIPS[name]) continue
      // A still with no phone cut (feed-post-open) is hidden on phones, by design.
      for (const [kind, cut] of [['desktop', still.desktop], ['phone', still.phone]] as const) {
        if (!cut) continue
        for (const file of [cut.files.light, cut.files.dark]) {
          expect(docCaptures[`/img/docs/${file}`], `${name} ${kind}: ${file}`).toEqual(cut.pixels)
        }
        expect([cut.displayWidth * 2, cut.displayHeight * 2], `${name} ${kind}`).toEqual(cut.pixels)
        // The crop, in app px, at the cut's scale (1 for phones and true-size cuts).
        const scale = cut.scale ?? 1
        expect([Math.round(cut.crop[2] * scale), Math.round(cut.crop[3] * scale)], `${name} ${kind}: the crop at its scale is the display size`).toEqual([cut.displayWidth, cut.displayHeight])
        // The site hangs every still from the column's left edge.
        expect([cut.at, cut.inset], `${name} ${kind}`).toEqual(['left', 0])
        const column = kind === 'desktop' ? COLUMN : 350
        expect(cut.overhang, `${name} ${kind}: runs ${cut.displayWidth - column}px past the ${column}px column`).toBe(Math.max(0, cut.displayWidth - column))
        if (kind === 'phone') expect(cut.overhang, `${name}: a phone cut fits the column`).toBe(0)
      }
    }
  })

  // Rules 2, 4b and 4c: one desktop scale, one of the preset frames, one fade.
  it('are, once recut, at the one desktop scale in a preset frame with the preset fades; phones at true size; clips too', () => {
    const framed = [...Object.entries(DOC_STILLS), ...Object.entries(DOC_CLIPS)].filter(([, still]) => isFramed(still.desktop))
    if (!framed.length) return
    const presets = DOC_STILL_PRESETS!
    expect(presets, 'src/docStills.json carries the manifest\'s _presets').toBeDefined()
    for (const [name, { desktop, phone }] of framed) {
      expect(desktop.scale, `${name}: the one desktop scale`).toBe(presets.scale)
      const frame = presets.frames[desktop.frame ?? '']
      expect(frame, `${name}: ${desktop.frame} is a preset frame`).toBeDefined()
      expect([desktop.crop[0], desktop.crop[2]], `${name}: the ${desktop.frame} frame`).toEqual([frame.x, frame.w])
      expect(desktop.displayWidth, name).toBe(Math.round(frame.w * presets.scale))
      expect(desktop.minDisplayWidth, `${name}: ${presets.minScale * 100}% of true size`).toBe(Math.ceil(frame.w * presets.minScale))
      const cuts = [['desktop', desktop, presets.scale, presets.rightBand * presets.scale], ['phone', phone, 1, presets.phoneRightBand]] as const
      for (const [kind, cut, scale, rightBand] of cuts) {
        if (!cut) continue
        expect(cut.scale ?? 1, `${name} ${kind}`).toBe(scale)
        // Whole CSS px, used as given: a size derived from crop x scale (621.36) would make the browser
        // resample the still and the clip differently.
        expect([cut.displayWidth, cut.displayHeight].every(Number.isInteger), `${name} ${kind}: whole display size`).toBe(true)
        expect(isFramed(cut), `${name} ${kind}: recut with the desktop cut`).toBe(true)
        for (const [side, [from, to]] of Object.entries(cut.fadeCss!)) {
          // Never on a real edge: a picture that reaches the window's edge shows it.
          expect([...cut.real, ...cut.divider], `${name} ${kind}: ${side} fades and is real`).not.toContain(side)
          const band = side === 'right' ? rightBand : presets.band * scale
          expect(Math.abs(Math.abs(to - from) - band), `${name} ${kind}: the ${side} band is ${Math.abs(to - from)}, the preset ${band}`).toBeLessThan(0.1)
        }
      }
    }
  })

  // The desktop cut's rules sit over the phone cut's, so one without fades must clear the phone's.
  it('fade only where their own cut does', () => {
    for (const [name, { desktop, phone }] of [...Object.entries(DOC_STILLS), ...Object.entries(DOC_CLIPS)].filter(([, still]) => isFramed(still.desktop))) {
      for (const [kind, cut] of [['desktop', desktop], ['phone', phone]] as const) {
        if (!cut) continue
        const frame = /\.doc-still-frame \{[^}]*\}/.exec(cutCss(name, cut))![0]
        expect(/mask-image: (none|linear-gradient)/.test(frame), `${name} ${kind}: sets its own mask`).toBe(true)
        expect(frame.includes('linear-gradient'), `${name} ${kind}: fades`).toBe(Object.keys(cut.fadeCss!).length > 0)
      }
    }
  })

  // DESIGN.md, Screenshots: a page takes recut pictures only when all of them are ready.
  it('switch whole pages: every picture on a page is recut, or none is', () => {
    const pages = new Map<string, boolean[]>()
    for (const still of Object.values(DOC_STILLS)) pages.set(still.page, [...pages.get(still.page) ?? [], isFramed(still.desktop)])
    for (const clip of Object.values(DOC_CLIPS)) pages.set(clip.page, [...pages.get(clip.page) ?? [], isFramed(clip.desktop)])
    for (const [page, framed] of pages) expect(new Set(framed).size, `${page}: ${framed.filter(Boolean).length} of ${framed.length} recut`).toBe(1)
  })

  it('sit in the section their manifest names, on that page', () => {
    for (const [name, { page, section }] of Object.entries(DOC_STILLS)) {
      const document = getDocument('desktop', page.replace(/^\/|\/$/g, ''))!
      const source = readFileSync(document.sourcePath.slice(1), 'utf8')
      const at = source.indexOf(`![](/img/docs/${name} "still")`)
      expect(at, `${name} is on ${page}`).toBeGreaterThan(-1)
      // Above the first h2, the section is the page's own h1. The manifest may shorten a heading
      // ("Shared lists" for "Shared todo lists, documents, and calendars"): each of its words is in it.
      const heading = [...source.slice(0, at).matchAll(/^#{1,2} (.+)$/gm)].at(-1)?.[1] ?? ''
      for (const word of (section ?? '').toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)) expect(heading.toLowerCase().split(/[^a-z0-9']+/), `${name}: ${section} in ${heading}`).toContain(word)
    }
  })
})
