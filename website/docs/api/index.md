# API Overview

All public APIs are named ESM exports from `@1pizzateam/loopr`. There is no default export and no namespace object, so you import exactly what you need and modern bundlers tree-shake the rest.

```javascript
import { Player, Clock } from '@1pizzateam/loopr';
```

## Core Modules

- **[Player](/api/player)** — The main animation loop manager wrapping `requestAnimationFrame` with frame rate capping (`capFPS`), lag spike clamping (`capDelta`), and play/pause controls.
- **[Clock](/api/clock)** — High-precision timer computing delta times (`computeDelta`), elapsed time (`total`), and running average FPS (`computeAverageFPS`) over a circular buffer.


