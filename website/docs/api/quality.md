# Quality

Adaptive resolution and quality scaler built on `RollingAverage` and `Utils.clamp` from `@1pizzateam/spock`.

## How It Works

`Quality` does not resize the screen or canvas by itself—it acts as a **decision maker** that outputs a scale multiplier (by default `1` → `0.85` → `0.7` → `0.55`):

1. **You feed it the frame time (`dt`)** on every tick via `quality.update(dt)`.
2. **If the frame rate stays normal**, `update(dt)` returns `null` (meaning *"do nothing, keep the current resolution"*).
3. **If the average frame rate drops below ~44 FPS** over a 45-frame window, `update(dt)` steps down to the next multiplier (e.g. `0.85`) and returns that new number.
4. **If the average frame rate stays above ~57 FPS for 8 seconds straight**, `update(dt)` steps back up (e.g. from `0.85` back to `1`) and returns the new number—unless that higher level already failed right after a previous promotion, in which case it locks that level out (`ceiling`) and stays at `0.85` so it doesn't bounce up and down forever.

When `quality.update(dt)` returns a number instead of `null`, your render loop uses `quality.scale` to resize the canvas internal rendering resolution (or lower particle counts, shadow quality, etc.) while keeping the CSS display size the same.

```javascript
import { Player, Quality } from '@1pizzateam/loopr';

const quality = new Quality();

const player = new Player((delta) => {
  const newScale = quality.update(delta);
  if (newScale !== null)
    renderer.setResolutionScale(newScale);

  renderer.render();
});

player.start();
```

## Constants & Types

### `SCALES`

```typescript
const SCALES: readonly number[] = [1, 0.85, 0.7, 0.55]
```

Default descending scale steps (from highest quality `1` down to lowest `0.55`).

### `QualityOptions`

```typescript
interface QualityOptions {
  scales?: readonly number[];  // Default: [1, 0.85, 0.7, 0.55]
  windowSize?: number;         // Default: 45 frames
  slowThreshold?: number;      // Default: 0.0225s (~44.4 FPS)
  fastThreshold?: number;      // Default: 0.0175s (~57.1 FPS)
  riseAfter?: number;          // Default: 8s of sustained fast frames
  failedWithin?: number;       // Default: 10s window after a rise to lock out a failing level
  ignoreAbove?: number;        // Default: 0.09s (ignore isolated stalls > 90ms)
}
```

## Properties

- `scales` — `readonly number[]`. Active array of resolution scales ordered from highest to lowest.
- `level` — `number`. Current index into `scales` (`0` = highest quality).
- `ceiling` — `number`. Highest quality index allowed (`0` initially; increases when a level fails within `failedWithin` seconds of rising).
- `scale` — `number` (getter). Current resolution scale (`this.scales[this.level]`).
- `window` — `RollingAverage`. Rolling frame-time window from `@1pizzateam/spock`.
- `fastTime` — `number`. Accumulated seconds spent in fast windows toward the next quality rise.
- `clock` — `number`. Cumulative accepted frame time in seconds.

---

## Constructor

Create a new `Quality` scaler with optional thresholds and scale levels.

```typescript
new Quality(options?: QualityOptions)
```

### Parameters

- `options` — `QualityOptions` (optional). Configuration overrides for `scales`, `windowSize`, `slowThreshold`, `fastThreshold`, `riseAfter`, `failedWithin`, and `ignoreAbove`.

### Returns

A new `Quality` instance initialized at `level = 0` (`scale = scales[0]`).

### Example

```javascript
import { Quality } from '@1pizzateam/loopr';

// Default scales [1, 0.85, 0.7, 0.55]
const defaultQuality = new Quality();

// Custom scale steps and thresholds
const customQuality = new Quality({
  scales: [1, 0.75, 0.5],
  windowSize: 60,
  slowThreshold: 0.02,
  fastThreshold: 0.0168,
});
```

---

## Quality.update()

Feed one frame's delta time in seconds. Evaluates the rolling average every `windowSize` valid frames and returns the new scale whenever the quality level changes, or `null` when unchanged.

```typescript
update(dt: number): number | null
```

### Parameters

- `dt` — `number`. Elapsed frame delta time in seconds (frames with `dt <= 0` or `dt > ignoreAbove` are ignored as isolated stalls).

### Returns

`number | null` — The new resolution scale when the quality level stepped up or down, otherwise `null`.

### Example

```javascript
import { Player, Quality } from '@1pizzateam/loopr';

const quality = new Quality();

const player = new Player((delta) => {
  const nextScale = quality.update(delta);
  if (nextScale !== null)
    resizeRenderTarget(nextScale);
});

player.start();
```

---

## Quality.reset()

Reset the quality scaler back to its highest quality level (`level = 0`, `ceiling = 0`) and clear the rolling frame window and timers.

```typescript
reset(): void
```

### Returns

`void`

### Example

```javascript
import { Quality } from '@1pizzateam/loopr';

const quality = new Quality();

// Reset when loading a new scene or level
quality.reset();
console.log(quality.scale);   // 1
console.log(quality.ceiling); // 0
```
