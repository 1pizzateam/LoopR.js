<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { Rand, Trigo, Utils, Vec2 } from '@1pizzateam/spock';
import { startCanvas } from '../canvas.js';

const SPEED = 100; // pixels per second
const SIZE = 50;   // 50x50 block as in code snippet
const DEFAULT_CAP = 30;

const canvas = ref(null);
const isRunning = ref(true);
const currentCap = ref(DEFAULT_CAP);
const timeDisplay = ref('0.00');
const fpsDisplay = ref(0);
const deltaDisplay = ref(0);
const ticksDisplay = ref(0);
const posX = ref(0);

const position = new Vec2(0, 100);
let width = 0;
let height = 0;
let stop = null;

// Particle system for motion trail
const rand = Rand.create(42);
const particles = [];
const MAX_PARTICLES = 40;
const PARTICLE_COLORS = ['#5b8cff', '#7da6ff', '#38c793', '#60a5fa', '#93c5fd'];

// Interactive click ripples
const ripples = [];

function spawnParticle(x, y) {
  if (particles.length >= MAX_PARTICLES) {
    particles.shift();
  }
  particles.push({
    x: x + rand.float(-4, 4),
    y: y + rand.float(-10, 10),
    vx: -SPEED * rand.float(0.2, 0.6),
    vy: rand.float(-15, 15),
    size: rand.float(2.5, 6),
    life: 1.0,
    maxLife: rand.float(0.4, 0.8),
    color: rand.pick(...PARTICLE_COLORS),
  });
}

function setCap(targetFps) {
  currentCap.value = targetFps;
  if (stop?.player) {
    stop.player.capFPS(targetFps);
  }
}

function togglePlay() {
  if (!stop?.player) return;
  isRunning.value = stop.player.toggle();
}

function restart() {
  position.x = 0;
  posX.value = 0;
  particles.length = 0;
  ripples.length = 0;
  if (stop?.player) {
    if (!isRunning.value) {
      isRunning.value = stop.player.toggle();
    }
  }
}

function handleCanvasClick(event) {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  position.x = Math.max(0, clickX - SIZE / 2);
  posX.value = position.x;
  
  // Add a shockwave ripple
  ripples.push({
    x: clickX,
    y: clickY,
    radius: 4,
    maxRadius: 65,
    life: 1.0,
  });
}

function draw(context, state, theme) {
  width = state.width;
  height = state.height;

  const centerY = Math.round(height * 0.44);
  const hoverY = centerY + Trigo.sine(state.time * 3.5) * 6;
  position.y = Math.round(hoverY - SIZE / 2);

  // Update telemetry
  fpsDisplay.value = Math.round(state.fps);
  deltaDisplay.value = state.delta;
  timeDisplay.value = state.time.toFixed(2);
  ticksDisplay.value = state.ticks;

  // Advance state using delta time
  if (isRunning.value) {
    position.x += SPEED * state.delta;
    if (position.x > width) position.x = -SIZE;
  }
  posX.value = Math.max(0, position.x);

  // Clear background
  context.fillStyle = theme.surface;
  context.fillRect(0, 0, width, height);

  // Draw ambient grid dots
  const gridSpacing = 40;
  context.fillStyle = theme.dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
  for (let gx = 20; gx < width; gx += gridSpacing) {
    for (let gy = 20; gy < height; gy += gridSpacing) {
      context.beginPath();
      context.arc(gx, gy, 1.2, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Runway track glowing beam
  const trackY = centerY;
  const beamGradient = context.createLinearGradient(0, trackY - 1, 0, trackY + 1);
  beamGradient.addColorStop(0, 'rgba(91, 140, 255, 0.05)');
  beamGradient.addColorStop(0.5, theme.dark ? 'rgba(91, 140, 255, 0.35)' : 'rgba(91, 140, 255, 0.25)');
  beamGradient.addColorStop(1, 'rgba(91, 140, 255, 0.05)');

  context.strokeStyle = beamGradient;
  context.lineWidth = 2;
  context.setLineDash([12, 10]);
  context.beginPath();
  context.moveTo(0, trackY);
  context.lineTo(width, trackY);
  context.stroke();
  context.setLineDash([]);

  // Distance ruler markings every 100px
  const rulerTextColor = theme.dark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)';
  const tickColor = theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
  context.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.textAlign = 'center';

  for (let mark = 0; mark < width; mark += 50) {
    const isMajor = mark % 100 === 0;
    const tickH = isMajor ? 8 : 4;
    context.strokeStyle = isMajor ? 'rgba(91, 140, 255, 0.4)' : tickColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(mark, trackY - tickH);
    context.lineTo(mark, trackY + tickH);
    context.stroke();

    if (isMajor) {
      context.fillStyle = rulerTextColor;
      context.fillText(`${mark}px`, mark, trackY + 22);
    }
  }

  // Spawn new particles from trailing edge when running
  if (isRunning.value && position.x >= 0 && position.x <= width) {
    spawnParticle(position.x, hoverY);
    if (Math.random() > 0.4) spawnParticle(position.x, hoverY);
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= state.delta / p.maxLife;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * state.delta;
    p.y += p.vy * state.delta;

    const currentRadius = p.size * p.life;
    context.save();
    context.globalAlpha = Utils.clamp(p.life, 0, 1) * 0.75;
    context.fillStyle = p.color;
    context.shadowColor = p.color;
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Update and draw ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.life -= state.delta * 2.2;
    r.radius += (r.maxRadius - r.radius) * state.delta * 8;
    if (r.life <= 0) {
      ripples.splice(i, 1);
      continue;
    }
    context.save();
    context.globalAlpha = Utils.clamp(r.life, 0, 1) * 0.5;
    context.strokeStyle = theme.accent;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  // Only draw runner if on screen
  if (position.x + SIZE > 0 && position.x < width) {
    // 1. Floor Reflection
    const floorY = trackY + 36;
    const reflectionH = 18;
    const reflGradient = context.createLinearGradient(0, floorY, 0, floorY + reflectionH);
    reflGradient.addColorStop(0, 'rgba(91, 140, 255, 0.18)');
    reflGradient.addColorStop(1, 'rgba(91, 140, 255, 0)');

    context.fillStyle = reflGradient;
    context.beginPath();
    if (context.roundRect) {
      context.roundRect(position.x + 4, floorY, SIZE - 8, reflectionH, [0, 0, 6, 6]);
      context.fill();
    } else {
      context.fillRect(position.x + 4, floorY, SIZE - 8, reflectionH);
    }

    // 2. Ambient aura beneath runner
    const glowGrad = context.createRadialGradient(
      position.x + SIZE / 2,
      hoverY,
      10,
      position.x + SIZE / 2,
      hoverY,
      SIZE * 1.2
    );
    glowGrad.addColorStop(0, 'rgba(91, 140, 255, 0.28)');
    glowGrad.addColorStop(1, 'rgba(91, 140, 255, 0)');
    context.fillStyle = glowGrad;
    context.beginPath();
    context.arc(position.x + SIZE / 2, hoverY, SIZE * 1.2, 0, Math.PI * 2);
    context.fill();

    // 3. Runner Block with modern gradient and shine
    context.save();
    context.shadowColor = 'rgba(91, 140, 255, 0.55)';
    context.shadowBlur = 18;

    const blockGrad = context.createLinearGradient(
      position.x,
      position.y,
      position.x + SIZE,
      position.y + SIZE
    );
    blockGrad.addColorStop(0, '#7ea6ff');
    blockGrad.addColorStop(0.5, '#5b8cff');
    blockGrad.addColorStop(1, '#3b6dd8');

    context.fillStyle = blockGrad;
    context.beginPath();
    if (context.roundRect) {
      context.roundRect(position.x, position.y, SIZE, SIZE, 10);
      context.fill();
    } else {
      context.fillRect(position.x, position.y, SIZE, SIZE);
    }
    context.restore();

    // 4. Sleek glass highlight sheen on upper half
    const sheenGrad = context.createLinearGradient(
      position.x,
      position.y,
      position.x,
      position.y + SIZE * 0.48
    );
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

    context.fillStyle = sheenGrad;
    context.beginPath();
    if (context.roundRect) {
      context.roundRect(position.x + 2, position.y + 2, SIZE - 4, SIZE * 0.46, [8, 8, 2, 2]);
      context.fill();
    } else {
      context.fillRect(position.x + 2, position.y + 2, SIZE - 4, SIZE * 0.46);
    }

    // 5. Border stroke
    context.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    context.lineWidth = 1.5;
    context.beginPath();
    if (context.roundRect) {
      context.roundRect(position.x, position.y, SIZE, SIZE, 10);
      context.stroke();
    } else {
      context.strokeRect(position.x, position.y, SIZE, SIZE);
    }

    // 6. Core pulsing loop symbol in center
    const pulseSize = 6 + Trigo.sine(state.time * 6) * 1.5;
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(position.x + SIZE / 2, hoverY, pulseSize, 0, Math.PI * 2);
    context.fill();

    // 7. Coordinates indicator above runner
    context.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    context.fillStyle = theme.accent;
    context.textAlign = 'center';
    context.fillText(`${Math.round(posX.value)}px`, position.x + SIZE / 2, position.y - 12);
  }
}

onMounted(() => {
  stop = startCanvas(canvas.value, draw, { fps: DEFAULT_CAP });
});

onBeforeUnmount(() => {
  stop?.();
});
</script>

<template>
  <section class="loop-section">
    <div class="loop-heading">
      <div>
        <p class="loop-eyebrow">Built with LoopR.js</p>
        <h2>Animation loop demo</h2>
        <p>
          A render loop managed by <code>Player</code>, updating state with delta time and capped at 30 FPS.
        </p>
      </div>
      <div class="loop-actions">
        <!-- FPS Cap Toggle -->
        <div class="loop-fps-group" role="group" aria-label="Framerate cap">
          <button
            v-for="fps in [15, 30, 60]"
            :key="fps"
            type="button"
            class="loop-pill-btn"
            :class="{ active: currentCap === fps }"
            :aria-pressed="currentCap === fps"
            @click="setCap(fps)"
          >
            {{ fps }} FPS
          </button>
        </div>

        <!-- Play / Pause -->
        <button
          type="button"
          class="loop-circle-btn"
          :aria-label="isRunning ? 'Pause animation loop' : 'Resume animation loop'"
          :title="isRunning ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <svg
            v-if="isRunning"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>

        <!-- Restart -->
        <button
          type="button"
          class="loop-circle-btn"
          aria-label="Restart animation"
          title="Restart"
          @click="restart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>

    <div class="loop-canvas">
      <canvas
        ref="canvas"
        aria-label="Interactive demo showing a glowing block with particles moving via LoopR delta time"
        @click="handleCanvasClick"
      ></canvas>
      <div class="loop-stats">
        <span>{{ fpsDisplay }} FPS (capped at {{ currentCap }})</span>
        <span>{{ (deltaDisplay * 1000).toFixed(1) }} ms Δt</span>
        <span>{{ timeDisplay }}s</span>
        <span>x: {{ Math.round(posX) }}px</span>
      </div>
    </div>

    <p class="loop-more">
      <a
        class="loop-icon"
        :href="withBase('/guide/examples')"
        aria-label="More demos"
        title="More demos"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="4" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      </a>
    </p>
  </section>
</template>

<style scoped>
.loop-section {
  max-width: 1152px;
  margin: 72px auto 0;
  padding: 0 24px 8px;
}

.loop-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 20px;
}

.loop-heading h2 {
  margin: 4px 0 8px;
  border: 0;
  font-size: 28px;
  line-height: 1.25;
}

.loop-heading p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.loop-heading .loop-eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loop-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.loop-fps-group {
  display: inline-flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 3px;
  background: var(--vp-c-bg-soft);
  gap: 2px;
}

.loop-pill-btn {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.loop-pill-btn:hover:not(.active) {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}

.loop-pill-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(91, 140, 255, 0.4);
}

.loop-circle-btn,
.loop-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.loop-circle-btn:hover,
.loop-icon:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-brand-1);
}

.loop-circle-btn:focus-visible,
.loop-icon:focus-visible,
.loop-pill-btn:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.loop-canvas {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.loop-canvas canvas {
  display: block;
  width: 100%;
  height: 270px;
}

.loop-stats {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 12px;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  color: var(--vp-c-text-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  pointer-events: none;
  backdrop-filter: blur(8px);
}

.loop-more {
  margin: 16px 0 0;
  text-align: right;
}

.loop-more a {
  color: var(--vp-c-brand-1);
  font-size: 15px;
  font-weight: 600;
}

.loop-more a:hover {
  color: var(--vp-c-brand-2);
}

@media (max-width: 640px) {
  .loop-section {
    margin-top: 48px;
  }

  .loop-heading {
    align-items: start;
    gap: 16px;
  }

  .loop-actions {
    width: 100%;
    justify-content: space-between;
  }

  .loop-canvas canvas {
    height: 230px;
  }

  .loop-stats {
    left: 12px;
    right: auto;
    font-size: 11px;
    gap: 8px;
    padding: 4px 8px;
  }
}
</style>
