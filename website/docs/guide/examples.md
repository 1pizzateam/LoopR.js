# Examples

Live interactive examples running `@1pizzateam/loopr` directly in your browser.

## Frame Rate Capping

Throttles the render loop to a target maximum framerate using `player.capFPS(maxFPS)`. Notice how motion remains temporally smooth while CPU workload and draw cycles are throttled. A dynamic jitter tolerance buffer ensures target framerates (like 15, 30, or 60 FPS) cleanly lock without dropping into harmonic sub-multiples caused by browser timer fluctuations.

<FpsCapDemo />

```javascript
import { Player } from '@1pizzateam/loopr';
import { Trigo, Vec2 } from '@1pizzateam/spock';

const center = new Vec2(150, 150);
const satellite = new Vec2();
let angle = 0;

const player = new Player((delta) => {
  // Motion remains temporally smooth
  angle += delta * 2.5;
  satellite.setScalar(
    center.x + Trigo.cosine(angle) * 70,
    center.y + Trigo.sine(angle) * 70
  );
  render(satellite);
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
import { Vec2 } from '@1pizzateam/spock';

const position = new Vec2(50, 100);
const velocity = new Vec2(140, 0); // Pixels per second

const player = new Player((delta) => {
  // Delta scales movement by actual elapsed seconds.
  // If framerate drops from 60 FPS to 15 FPS,
  // delta increases proportionally so real-world distance is identical!
  position.x += velocity.x * delta;
  render(position);
});

player.start();
```

---

## Self-Stopping Animations

The animation callback can return `false` to automatically trigger `player.stop()` when a task or transition completes.

<SelfStoppingDemo />

```javascript
import { Player } from '@1pizzateam/loopr';
import { Utils } from '@1pizzateam/spock';

let progress = 0;
const duration = 2.5; // seconds

const transition = new Player((delta) => {
  progress = Utils.clamp(progress + delta / duration, 0, 1.0);

  renderProgress(progress);

  if (progress >= 1.0) {
    return false; // LoopR automatically stops the loop!
  }
});

transition.start();
```

---

## Lag Spike Protection (Delta Clamping)

When a browser tab loses focus or the main thread is blocked by heavy computation, elapsed delta time can spike to several seconds. In physics simulations, large delta values cause objects to jump past collision boundaries (tunneling) or accelerate uncontrollably.

<DeltaClampDemo />

Use `player.capDelta(maxSeconds)` to enforce an upper bound on frame duration:

```javascript
import { Player } from '@1pizzateam/loopr';
import { Vec2 } from '@1pizzateam/spock';

const position = new Vec2(0, 100);
const velocity = new Vec2(200, 0);

const player = new Player((delta) => {
  // delta will never exceed 0.1 seconds (100ms), even after a 5-second tab freeze!
  position.x += velocity.x * delta;
  render(position);
});

// Clamp maximum frame delta to 100ms (0.1s)
player.capDelta(0.1);
player.start();
```

