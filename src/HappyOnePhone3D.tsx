import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { PhoneScene } from './happyOnePhoneScene'

type Props = {
  video: RefObject<HTMLVideoElement | null>
  focused: boolean
  inspecting: boolean
  inspect: () => void
}

// Retained alternative; the landing page deliberately uses HappyOnePhone instead.
export function HappyOnePhone3D({ video, focused, inspecting, inspect }: Props) {
  const host = useRef<HTMLButtonElement>(null)
  const scene = useRef<PhoneScene | null>(null)
  const focus = useRef(focused)

  useEffect(() => {
    focus.current = focused
    scene.current?.focus(focused)
  }, [focused])

  useEffect(() => {
    const element = host.current!
    const largePointer = matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)')
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    let visible = false
    let loading: AbortController | undefined
    let failed = false
    let disposed = false
    const eligible = () => largePointer.matches && !reducedMotion.matches && !device.connection?.saveData
      && navigator.hardwareConcurrency >= 8 && (device.deviceMemory === undefined || device.deviceMemory >= 8)
      && 'requestVideoFrameCallback' in HTMLVideoElement.prototype
    const stop = () => {
      loading?.abort()
      loading = undefined
      scene.current?.dispose()
      scene.current = null
    }
    const reconcile = () => {
      if (!eligible()) { stop(); return }
      scene.current?.visible(visible)
      if (disposed || failed || !visible || loading || scene.current) return
      const controller = new AbortController()
      loading = controller
      void import('./happyOnePhoneScene').then(module => {
        if (controller.signal.aborted) return null
        return module.phoneSceneCreate(element, video.current!, controller.signal, () => {
          failed = true
          stop()
        })
      }).then(value => {
        if (!value) return
        if (disposed || controller.signal.aborted) { value.dispose(); return }
        scene.current = value
        value.focus(focus.current)
        value.visible(visible)
      }).catch(() => {
        if (!controller.signal.aborted) failed = true
      }).finally(() => {
        if (loading === controller) loading = undefined
      })
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      reconcile()
    })
    observer.observe(element)
    largePointer.addEventListener('change', reconcile)
    reducedMotion.addEventListener('change', reconcile)
    return () => {
      disposed = true
      observer.disconnect()
      largePointer.removeEventListener('change', reconcile)
      reducedMotion.removeEventListener('change', reconcile)
      stop()
    }
  }, [video])

  return (
    <button ref={host} type="button" className="one-demo-phone one-demo-phone-3d" aria-label="Take a closer look at the iPhone"
      aria-pressed={inspecting} onClick={inspect}
      onPointerMove={event => {
        if (event.pointerType !== 'mouse') return
        const box = event.currentTarget.getBoundingClientRect()
        scene.current?.tilt((event.clientX - box.left) / box.width * 2 - 1, (event.clientY - box.top) / box.height * 2 - 1)
      }} onPointerLeave={() => scene.current?.tilt(0, 0)}>
      <span className="one-phone-flat">
        <video ref={video} poster="/video/happy-one/v13/phone-poster.webp" width="804" height="1748"
          muted playsInline preload="none" aria-label="The same live session on iPhone" />
        <img src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822"
          alt="iPhone 16 Pro in Black Titanium" />
      </span>
    </button>
  )
}