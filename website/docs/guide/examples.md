# Examples

Live interactive examples running `@1pizzateam/loopr` directly in your browser.

## Frame Rate Capping

Throttles the render loop to a target maximum framerate using `player.capFPS(maxFPS)`. Notice how motion remains temporally smooth while CPU workload and draw cycles are throttled.

<FpsCapDemo />

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  // Motion remains temporally smooth
  angle += delta * 2.5;
  render();
});

// Cap loop to 30 FPS to save CPU / battery
player.capFPS(30);
player.start();

// Uncap (0) to run at full screen refresh rate
player.capFPS(0);
```

---

## Playback Lifecycle & Status

Full control over playback state with `start()`, `pause()`, `toggle()`, and `stop()`, combined with real-time status queries via `isActive()`, `getTime()`, and `getTicks()`.

<ControlsDemo />

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  posX += speed * delta;
  render();
});

player.start();  // Begins loop
player.pause();  // Freezes animation without resetting clock
player.toggle(); // Alternates between playing and paused
player.stop();   // Cancels frame and resets clock counters to 0

console.log(player.isActive()); // boolean: true if running
console.log(player.getTime());  // Cumulative active running seconds
console.log(player.getTicks()); // Total rendered frames
```

---

## Frame-Rate Independent Physics

Why delta time matters: comparing fixed-step movement against delta-scaled movement. Click **Simulate Lag** to see how delta keeps speed constant even during framerate drops.

<DeltaMotionDemo />

```javascript
import { Player } from '@1pizzateam/loopr';

const speed = 140; // Pixels per second

const player = new Player((delta) => {
  // Delta scales movement by actual elapsed seconds.
  // If framerate drops from 60 FPS to 15 FPS,
  // delta increases proportionally so real-world distance is identical!
  runner.x += speed * delta;
});

player.start();
```

---

## Self-Stopping Animations

The animation callback can return `false` to automatically trigger `player.stop()` when a task or transition completes.

<SelfStoppingDemo />

```javascript
import { Player } from '@1pizzateam/loopr';

let progress = 0;
const duration = 2.5; // seconds

const transition = new Player((delta) => {
  progress += delta / duration;

  if (progress >= 1.0) {
    progress = 1.0;
    renderProgress(progress);
    return false; // LoopR automatically stops the loop!
  }

  renderProgress(progress);
});

transition.start();
```

---

## Lag Spike Protection (Delta Clamping)

When a browser tab loses focus or the main thread is blocked by heavy computation, elapsed delta time can spike to several seconds. In physics simulations, large delta values cause objects to pass through obstacles (tunneling) or accelerate uncontrollably.

Use `player.capDelta(maxSeconds)` to enforce an upper bound on frame duration:

```javascript
import { Player } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  // delta will never exceed 0.1 seconds (100ms), even after a 5-second tab freeze!
  physics.update(delta);
  render();
});

// Clamp maximum frame delta to 100ms (0.1s)
player.capDelta(0.1);
player.start();
```

