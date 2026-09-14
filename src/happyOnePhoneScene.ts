import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const DEVICE = '/video/happy-one/device'

export type PhoneScene = {
  focus: (focused: boolean) => void
  tilt: (x: number, y: number) => void
  visible: (visible: boolean) => void
  dispose: () => void
}

export async function phoneSceneCreate(host: HTMLElement, video: HTMLVideoElement, signal: AbortSignal, fallback: () => void): Promise<PhoneScene> {
  const canvas = document.createElement('canvas')
  canvas.className = 'one-phone-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const context = canvas.getContext('webgl2', {
    alpha: true, antialias: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true,
  })
  if (!context) throw new Error('A suitable hardware WebGL context is unavailable.')
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  const scene = new THREE.Scene()
  const group = new THREE.Group()
  scene.add(group)
  const camera = new THREE.OrthographicCamera(-.04, .04, .078, -.078, .01, 2)
  camera.position.z = .4
  const target = new THREE.Vector2()
  let focused = false
  let shown = true
  let disposed = false
  let animation = 0
  let videoFrame = 0
  let warmFrames = 0
  let slowFrames = 0
  let sizeReady = false
  let pendingSize: { width: number; height: number } | undefined
  let model: THREE.Group | undefined
  let environment: THREE.WebGLRenderTarget | undefined
  let display: THREE.Mesh | undefined
  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.colorSpace = THREE.SRGBColorSpace
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.generateMipmaps = false
  const textures = new Set<THREE.Texture>([videoTexture])
  const materials = new Set<THREE.Material>()
  const geometries = new Set<THREE.BufferGeometry>()

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(animation)
    if (videoFrame) video.cancelVideoFrameCallback(videoFrame)
    resize.disconnect()
    canvas.removeEventListener('webglcontextlost', contextLost)
    video.removeEventListener('seeked', invalidate)
    video.removeEventListener('loadeddata', invalidate)
    video.removeEventListener('play', trackVideo)
    document.removeEventListener('visibilitychange', visibilityChanged)
    textures.forEach(texture => texture.dispose())
    materials.forEach(material => material.dispose())
    geometries.forEach(geometry => geometry.dispose())
    environment?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
    delete host.dataset.renderer
  }
  function contextLost(event: Event) {
    event.preventDefault()
    dispose()
    fallback()
  }
  function draw() {
    animation = 0
    if (disposed || !shown || document.hidden || !model || !display || (!sizeReady && !pendingSize)) return
    const x = focused ? target.y * .06 : target.y * .08
    const y = (focused ? 0 : -.18) + target.x * .18
    group.rotation.x += (x - group.rotation.x) * .22
    group.rotation.y += (y - group.rotation.y) * .22
    group.rotation.z += ((focused ? 0 : -.025) - group.rotation.z) * .22
    const start = performance.now()
    if (pendingSize) {
      const { width, height } = pendingSize
      pendingSize = undefined
      // Apply real layout resizes in the same frame as the redraw. Assigning
      // canvas dimensions in ResizeObserver would clear an already drawn frame.
      const vertical = .1495369 / (2710 / 2822)
      camera.left = -vertical * width / height / 2
      camera.right = -camera.left
      camera.top = vertical / 2
      camera.bottom = -camera.top
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      sizeReady = true
    }
    renderer.render(scene, camera)
    if (host.dataset.renderer !== 'webgl') host.dataset.renderer = 'webgl'
    // Shader warm-up is excluded. Repeated expensive draws abandon enhancement.
    if (++warmFrames > 12) {
      slowFrames = performance.now() - start > 14 ? slowFrames + 1 : 0
      if (slowFrames >= 8) { dispose(); fallback(); return }
    }
    if (Math.abs(group.rotation.x - x) + Math.abs(group.rotation.y - y) + Math.abs(group.rotation.z - (focused ? 0 : -.025)) > .0005) invalidate()
  }
  function invalidate() {
    if (!disposed && shown && !document.hidden && !animation) animation = requestAnimationFrame(draw)
  }
  function trackVideo() {
    if (disposed || !shown || document.hidden || videoFrame) return
    videoFrame = video.requestVideoFrameCallback(() => {
      videoFrame = 0
      invalidate()
      trackVideo()
    })
  }
  function visibilityChanged() {
    if (document.hidden) {
      cancelAnimationFrame(animation); animation = 0
      if (videoFrame) video.cancelVideoFrameCallback(videoFrame)
      videoFrame = 0
    } else { invalidate(); trackVideo() }
  }
  const resize = new ResizeObserver(([entry]) => {
    // Layout size excludes the animated CSS transform. Allocate once at the
    // expanded size so zooming never reallocates or undersamples the canvas.
    const { width, height } = entry.contentRect
    if (!width || !height || disposed) return
    pendingSize = { width, height }
    invalidate()
  })
  canvas.addEventListener('webglcontextlost', contextLost)
  video.addEventListener('seeked', invalidate)
  video.addEventListener('loadeddata', invalidate)
  video.addEventListener('play', trackVideo)
  document.addEventListener('visibilitychange', visibilityChanged)

  try {
    const response = await fetch(`${DEVICE}/iphone-16-pro-black.glb`, { signal })
    if (!response.ok) throw new Error('Phone model unavailable.')
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), `${DEVICE}/`)
    model = gltf.scene
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      geometries.add(object.geometry)
      const items = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of items) {
        materials.add(material)
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
      }
    })
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    model.position.set(-.000017, -.074968, 0)
    group.add(model)
    const room = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(renderer)
    environment = generator.fromScene(room, .04)
    scene.environment = environment.texture
    room.dispose()
    generator.dispose()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x45454c, .65))
    const key = new THREE.DirectionalLight(0xffffff, 2)
    key.position.set(-1, 2, 3)
    scene.add(key)

    const alpha = await new THREE.TextureLoader().loadAsync(`${DEVICE}/screen-alpha.png`)
    textures.add(alpha)
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    // The recorded screen is exactly 1206×2622. Fit the actual 16 Pro display,
    // not the outer glass; native corner/Island masking comes from the recording.
    const width = .1495369 * 1206 / 2710
    const geometry = new THREE.PlaneGeometry(width, width * 2622 / 1206)
    const material = new THREE.MeshBasicMaterial({ map: videoTexture, alphaMap: alpha, alphaTest: .5, toneMapped: false })
    geometries.add(geometry); materials.add(material)
    display = new THREE.Mesh(geometry, material)
    display.position.set(0, 0, .00418)
    group.add(display)
    group.rotation.y = -.18
    group.rotation.z = -.025
    host.append(canvas)
    resize.observe(host)
    invalidate()
    trackVideo()
    return {
      focus(value) { focused = value; invalidate() },
      tilt(x, y) { target.set(x, y); invalidate() },
      visible(value) {
        shown = value
        if (value) { invalidate(); trackVideo() }
        else {
          cancelAnimationFrame(animation); animation = 0
          if (videoFrame) video.cancelVideoFrameCallback(videoFrame)
          videoFrame = 0
        }
      },
      dispose,
    }
  } catch (error) {
    dispose()
    throw error
  }
}