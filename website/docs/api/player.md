# Player

The main animation frame request controller.

`Player` wraps browser `requestAnimationFrame` and orchestrates render loops with a high-precision internal clock, frame rate capping, delta tracking, and play/pause controls.

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  console.log(`Render frame delta: ${delta}s`);
});

player.start();
```

---

## Constructor

Create a new `Player` instance with an animation callback.

```typescript
new Player(callback: PlayerCallback)
```

### Parameters

- `callback` — `(delta?: number) => boolean | void`. The render function executed on every animation frame. It receives the delta time in seconds. Return `false` to automatically stop the loop.

### Returns

A new `Player` instance.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  box.x += speed * delta;
});

// Self-stopping loop
let progress = 0;
const transition = new Player((delta) => {
  progress += delta;
  if (progress >= 1.0) {
    return false; // Automatically stops the animation
  }
});
transition.start();
```

---

## Player.capFPS()

Cap the maximum frame rate of the animation loop.

```typescript
capFPS(maxFPS: number): void
```

### Parameters

- `maxFPS` — `number`. Target maximum frames per second (e.g. `30` or `60`). Pass `0` to remove the limit and run at the screen's maximum refresh rate.

### Returns

`void`

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(() => {
  render();
});

// Cap animation to 30 FPS to save battery or CPU
player.capFPS(30);
player.start();

// Later, uncap to run at full display refresh rate
player.capFPS(0);
```

---

## Player.getTick()

Get the duration of the current frame in seconds.

```typescript
getTick(): number
```

### Returns

`number` — Frame delta time in seconds.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

let position = 0;
const speed = 100; // 100 pixels per second

const player = new Player(() => {
  const dt = player.getTick();
  position += speed * dt;
  element.style.transform = `translateX(${position}px)`;
});

player.start();
```

---

## Player.getTime()

Get the total active animation time elapsed in seconds since start.

```typescript
getTime(): number
```

### Returns

`number` — Cumulative active time in seconds (excluding paused periods).

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(() => {
  const elapsed = player.getTime();
  element.style.opacity = (Math.sin(elapsed * 2) + 1) / 2;
});

player.start();
```

---

## Player.getFPS()

Get the moving average frames per second calculated over the last 60 frames.

```typescript
getFPS(): number
```

### Returns

`number` — Average frame rate.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const fpsDisplay = document.getElementById('fps-counter');

const player = new Player(() => {
  renderScene();
  fpsDisplay.textContent = `${Math.round(player.getFPS())} FPS`;
});

player.start();
```

---

## Player.getTicks()

Get the total number of frames (ticks) rendered since the player started.

```typescript
getTicks(): number
```

### Returns

`number` — Total frame count.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(() => {
  renderScene();
  if (player.getTicks() % 100 === 0) {
    console.log(`Rendered ${player.getTicks()} frames`);
  }
});

player.start();
```

---

## Player.isActive()

Check whether the animation loop is currently active and running.

```typescript
isActive(): boolean
```

### Returns

`boolean` — `true` if the loop is running, `false` if paused or stopped.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(render);
console.log(player.isActive()); // false

player.start();
console.log(player.isActive()); // true

player.pause();
console.log(player.isActive()); // false
```

---

## Player.setScope()

Bind a custom `this` context to the animation callback function.

```typescript
setScope(scope: object): void
```

### Parameters

- `scope` — `object`. The context object to bind as `this` inside the callback.

### Returns

`void`

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

class GameScene {
  constructor() {
    this.playerCount = 4;
    this.player = new Player(this.render);
    this.player.setScope(this);
  }

  render(delta) {
    console.log(`Rendering scene for ${this.playerCount} players, delta: ${delta}`);
  }

  start() {
    this.player.start();
  }
}

const scene = new GameScene();
scene.start();
```

---

## Player.start()

Start the animation loop.

```typescript
start(): boolean
```

### Returns

`boolean` — `true` if the animation was successfully started, `false` if it was already running.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(draw);
const started = player.start();
console.log(started); // true

// Calling start() again while already active returns false
console.log(player.start()); // false
```

---

## Player.toggle()

Toggle playback between running and paused states.

```typescript
toggle(): boolean
```

### Returns

`boolean` — `true` if the player started playing, `false` if it was paused.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(draw);
player.start();

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    const isPlaying = player.toggle();
    console.log(isPlaying ? 'Resumed' : 'Paused');
  }
});
```

---

## Player.pause()

Pause the animation loop without resetting elapsed time or tick counts.

```typescript
pause(): boolean
```

### Returns

`boolean` — `true` if the player was running and was paused, `false` if it was already paused or stopped.

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(render);
player.start();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    player.pause();
  } else {
    player.start();
  }
});
```

---

## Player.stop()

Stop the animation loop and reset the internal clock (delta, elapsed time, and tick counts are reset to zero).

```typescript
stop(): void
```

### Returns

`void`

### Example

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player(render);
player.start();

stopButton.addEventListener('click', () => {
  player.stop();
  console.log(player.getTime());  // 0
  console.log(player.getTicks()); // 0
});
```
