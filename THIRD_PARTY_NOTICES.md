# Third-party notices

## Paper Shaders

Powered by Paper Shaders: https://shaders.paper.design

`src/grainGradientShader.ts` is Paper's Grain Gradient (Apache-2.0), as ported
through Happy's native Android `ui/start/GrainGradient.kt` and iOS
`HappyUI/Start/GrainGradientView.swift` (`slopus/happy` commit `0d226074d`) and
then to WebGL for happy-desktop's onboarding (`slopus/happy-desktop` commit
`aa8e7a43`, `packages/happy-desktop-ui/src/onboardingGrainShader.ts`). The
shader source is copied unchanged from happy-desktop. Upstream:
https://github.com/paper-design/shaders, `grain-gradient.ts`, `shader-utils.ts`,
and `vertex-shader.ts`.

License: [Apache-2.0](licenses/Paper-Shaders-Apache-2.0.txt).

## dotLottie

`@lottiefiles/dotlottie-web` (MIT) draws the homepage's animated emoji, as in
happy-desktop.
