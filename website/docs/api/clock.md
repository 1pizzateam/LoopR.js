# Clock

A high precision internal clock for the Player.

`Clock` provides precise timing tracking for animations, calculating delta times between frames, cumulative elapsed time, and running average FPS over a circular buffer.

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start();

function render() {
  const now = performance.now();
  const delta = clock.computeDelta(now);
  clock.tick(now);

  console.log(`Delta: ${delta}ms, Average FPS: ${clock.computeAverageFPS()}`);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
```

## Properties

- `ticks` — `number`. Total frame tick counter (default `0`).
- `total` — `number`. Total elapsed time accumulated across ticks in milliseconds.
- `delta` — `number`. Duration between the last two frames in milliseconds.

---

## Constructor

Create a new `Clock` instance initialized to zero state.

```typescript
new Clock()
```

### Returns

A new `Clock` instance.

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
console.log(clock.ticks); // 0
console.log(clock.total); // 0
console.log(clock.delta); // 0
```

---

## Clock.reset()

Reset the clock state back to initial values (`now = 0`, `total = 0`, `delta = 0`, `ticks = 0`, and resets the FPS circular buffer).

```typescript
reset(): void
```

### Returns

`void`

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start();

// Later, reset all timing metrics
clock.reset();
console.log(clock.ticks); // 0
console.log(clock.total); // 0
console.log(clock.delta); // 0
```

---

## Clock.start()

Initialize the clock's starting timestamp to the current high-resolution time.

```typescript
start(): void
```

### Returns

`void`

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start(); // captures performance.now()
```

---

## Clock.tick()

Advance the clock state to the specified timestamp. Updates `now`, accumulates `total` time, records the instantaneous FPS into the circular buffer, and increments `ticks`.

```typescript
tick(now: number): void
```

### Parameters

- `now` — `number`. Current timestamp in milliseconds.

### Returns

`void`

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start();

function loop(timestamp) {
  clock.computeDelta(timestamp);
  clock.tick(timestamp);
  console.log(`Ticks: ${clock.ticks}, Total time: ${clock.total}ms`);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```

---

## Clock.computeDelta()

Calculate the delta time in milliseconds between the given timestamp and the previous recorded timestamp.

```typescript
computeDelta(now: number): number
```

### Parameters

- `now` — `number`. Current timestamp in milliseconds (typically from `performance.now()` or `requestAnimationFrame` callback).

### Returns

`number` — Elapsed duration in milliseconds since the last tick or start.

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start();

function loop(timestamp) {
  const delta = clock.computeDelta(timestamp);
  console.log(`Elapsed since last frame: ${delta}ms`);
  clock.tick(timestamp);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```

---

## Clock.computeAverageFPS()

Calculate the moving average frames per second from the internal 60-frame buffer.

```typescript
computeAverageFPS(): number
```

### Returns

`number` — Moving average FPS.

### Example

```javascript
import { Clock } from '@1pizzateam/loopr';

const clock = new Clock();
clock.start();

function loop(timestamp) {
  clock.computeDelta(timestamp);
  clock.tick(timestamp);
  const fps = clock.computeAverageFPS();
  fpsElement.textContent = `FPS: ${Math.round(fps)}`;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```
