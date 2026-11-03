import { HEADLINES, PALETTES, homeVariantSet, type HomeVariants } from './homeVariants'

/** The dev server's corner control for the homepage variants; production never renders it. */
export function HomeVariantSwitcher({ palette, hero }: HomeVariants) {
  return (
    <form className="home-variants" aria-label="Homepage variants" onSubmit={event => event.preventDefault()}>
      <label>
        <span>Palette</span>
        <select value={palette} onChange={event => homeVariantSet('palette', event.target.value)}>
          {PALETTES.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label>
        <span>Hero</span>
        <select value={hero} onChange={event => homeVariantSet('hero', event.target.value)}>
          {HEADLINES.map((lines, index) => (
            <option key={index} value={index + 1}>{`${index + 1}. ${lines.join(' ')}`}</option>
          ))}
        </select>
      </label>
    </form>
  )
}
