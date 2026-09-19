# Overview

LoopR.js is an open-source animation loop library written in TypeScript. It provides a simple API to manage `requestAnimationFrame`, compute frame timing, and track elapsed time with high precision.

## Highlights

- No heavy runtime dependencies
- ESM and TypeScript declarations
- High precision time delta calculation and running average FPS
- Framerate capping (`capFPS`) and lag spike delta clamping (`capDelta`)
- Start, stop, and pause loops effortlessly

## Quick start

```js
import { Player } from '@1pizzateam/loopr';

// Pass a callback function that runs every frame, receiving delta in seconds
const loop = new Player((delta) => {
  console.log(`Render tick. Delta: ${delta}s`);
});

loop.start();
```

## API groups

- [Player](/api/player): The main orchestration class that runs the frame requests.
- [Clock](/api/clock): High-precision timer you can use independently or as part of the Player.


