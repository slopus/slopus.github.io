import { useEffect, useRef } from 'react'

// DM Sans Medium, optical size 18; original outlines from Google Fonts:
// https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@18,500
// Copyright 2014 The DM Sans Project Authors, SIL Open Font License 1.1.
// This is outlined artwork, not a redistributed font. Corresponding segments
// keep each stem/hump aligned as curves straighten into the uppercase glyphs.
const glyphs = [
  {
    lower: 'M168 800L68 800L68 299L158 299L165 370Q189 331 229 309Q269 287 319 287Q357 287 388.5 297.5Q420 308 444 329Q468 350 483 381Q510 337 555.5 312Q601 287 653 287Q714 287 758 311.5Q802 336 825.5 385Q849 434 849 507L849 800L750 800L750 517Q750 446 721 409.5Q692 373 637 373Q600 373 571 392Q542 411 525 447.5Q508 484 508 537L508 800L409 800L409 517Q409 446 380 409.5Q351 373 296 373Q260 373 230.5 392Q201 411 184.5 447.5Q168 484 168 537L168 800Z',
    upper: 'M172 800L72 800L72 100L190 100L190 100Q213.9 147.2 237.8 194.4Q261.7 241.6 285.6 288.8Q309.5 336 333.4 383.2Q357.3 430.4 381.2 477.6Q405.1 524.8 429 572Q488.25 454 547.5 336Q606.75 218 666 100Q725.5 100 785 100Q785 143.75 785 187.5Q785 231.25 785 275L785 800L685 800L685 275Q663.2 317.6 641.4 360.2Q619.6 402.8 597.8 445.4Q576 488 554.2 530.6Q532.4 573.2 510.6 615.8Q488.8 658.4 467 701L467 701L390 701L390 701Q335.5 594.75 281 488.5Q226.5 382.25 172 276Q172 319.5 172 363Q172 406.5 172 450Q172 493.5 172 537L172 800Z',
  },
  {
    lower: 'M1083 800L983 800L983 299L1083 299L1083 800M1033 203Q1005 203 986.5 185Q968 167 968 139Q968 112 986.5 94.5Q1005 77 1033 77Q1061 77 1080.5 94.5Q1100 112 1100 139Q1100 167 1080.5 185Q1061 203 1033 203Z',
    upper: 'M1029 800L929 800L929 100L1029 100L1029 800M979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Q979 139 979 139Z',
  },
  {
    lower: 'M1514 800L1432 800Q1385 800 1350 785Q1315 770 1296 735Q1277 700 1277 640L1277 384L1190 384L1190 299L1277 299L1289 174L1377 174L1377 299L1519 299L1519 384L1377 384L1377 641Q1377 684 1394.5 699.5Q1412 715 1457 715L1514 715L1514 800Z',
    upper: 'M1438 800L1338 800Q1338 773.33 1338 746.67Q1338 720 1338 693.33Q1338 666.67 1338 640L1338 182L1130 182L1130 100L1338 100L1338 100L1438 100L1438 100L1645 100L1645 182L1438 182L1438 641Q1438 670.5 1438 700Q1438 750 1438 800L1438 800L1438 800Z',
  },
].map(glyph => ({
  ...glyph,
  from: glyph.lower.match(/[\d.]+/g)!.map(Number),
  to: glyph.upper.match(/[\d.]+/g)!.map(Number),
}))

const DURATION = 700

export function MitGlyphMorph({ active }: { active: boolean }) {
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!active || !svg.current) return
    const paths = svg.current.querySelectorAll('path')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const finish = () => {
      cancelAnimationFrame(frame)
      paths.forEach((path, index) => path.setAttribute('d', glyphs[index].upper))
    }
    if (motion.matches) { finish(); return }
    const started = performance.now()
    const draw = (now: number) => {
      const progress = Math.min(1, (now - started) / DURATION)
      const eased = progress * progress * (3 - 2 * progress)
      paths.forEach((path, index) => {
        const glyph = glyphs[index]
        let coordinate = 0
        path.setAttribute('d', glyph.lower.replace(/[\d.]+/g, () => {
          const i = coordinate++
          return (glyph.from[i] + (glyph.to[i] - glyph.from[i]) * eased).toFixed(2)
        }))
      })
      if (progress < 1) frame = requestAnimationFrame(draw)
      else finish()
    }
    frame = requestAnimationFrame(draw)
    const onMotionChange = () => { if (motion.matches) finish() }
    motion.addEventListener('change', onMotionChange)
    return () => {
      cancelAnimationFrame(frame)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [active])

  return (
    <span className="one-mit">
      <span className="one-mit-text">{active ? 'MIT' : 'mit'}</span>
      <svg ref={svg} viewBox="0 0 1674 1000" aria-hidden="true" focusable="false">
        {glyphs.map((glyph, index) => <path key={index} d={glyph.lower} />)}
      </svg>
    </span>
  )
}