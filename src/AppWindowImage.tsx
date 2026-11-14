/** A full app capture on the page, with its window edge and shadow. `addChrome` is for
 * the multiplayer recorder's 1133-wide captures, which reserve the top 40px for controls. */
export function AppWindowImage({ src, alt, addChrome = false }: { src: string; alt: string; addChrome?: boolean }) {
  return (
    <span className="app-window-image">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {addChrome && (
        <svg className="app-window-chrome" viewBox="0 0 1133 40" aria-hidden="true" focusable="false">
          <circle cx="20" cy="20" r="6" fill="#ff5f57" stroke="#e0443e" />
          <circle cx="40" cy="20" r="6" fill="#febc2e" stroke="#dea123" />
          <circle cx="60" cy="20" r="6" fill="#28c840" stroke="#1aab29" />
        </svg>
      )}
    </span>
  )
}