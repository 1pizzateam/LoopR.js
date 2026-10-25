# API Overview

All public APIs are named ESM exports from `@1pizzateam/loopr`. There is no default export and no namespace object, so you import exactly what you need and modern bundlers tree-shake the rest.

```javascript
import { Player, Clock, Quality, SCALES, Time, Accumulator, RollingAverage } from '@1pizzateam/loopr';
```

## Core Modules

- **[Player](/api/player)** — The main animation loop manager wrapping `requestAnimationFrame` with frame rate capping (`capFPS`), lag spike clamping (`capDelta`), and play/pause controls.
- **[Clock](/api/clock)** — High-precision timer computing delta times (`computeDelta`), elapsed time (`total`), and running average FPS (`computeAverageFPS`) over a circular buffer.
- **[Quality](/api/quality)** — Adaptive resolution / quality scaler (`Quality`, `SCALES`, `QualityOptions`) that drops scale on sustained slow frames, ignores isolated stalls, rises after sustained fast frames, and locks out unstable levels.

## Re-Exported Spock Timing Primitives

`@1pizzateam/loopr` also re-exports core timing and windowing primitives from `@1pizzateam/spock` for convenience:

- **`Time`** — High-resolution monotonic timestamp (`Time.now()`), unit conversions (`millisecToSec`, `secToMillisec`, `millisecToFps`, `fpsToMillisec`), and delta clamping (`clampDelta`).
- **`Accumulator`** — Fixed-timestep physics accumulator (`step(delta, tick)`, `alpha`, `reset()`) with spiral-of-death clamping.
- **`RollingAverage`** — $O(1)$ circular buffer running average calculator (`push(sample)`, `average`, `count`, `reset()`).



