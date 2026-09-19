<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Player } from '@1pizzateam/loopr';
import { Vec2 } from '@1pizzateam/spock';

const canvasRef = ref(null);
const unclampedDeltaDisplay = ref('16.7');
const clampedDeltaDisplay = ref('16.7');
const hasTunneled = ref(false);
const isSpiking = ref(false);

let rawPlayer = null;
let protectedPlayer = null;

const unclampedPos = new Vec2(50, 0);
const clampedPos = new Vec2(50, 0);
let unclampedVel = 140; // px/s
let clampedVel = 140;

let rawDeltaSec = 0.016;
let clampedDeltaSec = 0.016;

function triggerLagSpike(ms = 600) {
  if (isSpiking.value) return;
  isSpiking.value = true;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const w = canvas.getBoundingClientRect().width;
  const wallX = w - 120;

  // Position both runners right in front of the wall moving towards it
  unclampedPos.x = wallX - 40;
  clampedPos.x = wallX - 40;
  unclampedVel = 140;
  clampedVel = 140;
  hasTunneled.value = false;

  requestAnimationFrame(() => {
    setTimeout(() => {
      const start = performance.now();
      while (performance.now() - start < ms) {
        // Synchronous main-thread busy wait to simulate lag spike or tab freeze
      }
      isSpiking.value = false;
    }, 40);
  });
}

function resetSimulation() {
  unclampedPos.x = 50;
  clampedPos.x = 50;
  unclampedVel = 140;
  clampedVel = 140;
  hasTunneled.value = false;
  unclampedDeltaDisplay.value = '16.7';
  clampedDeltaDisplay.value = '16.7';
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Raw, unclamped Player (capDelta = 0 / default)
  rawPlayer = new Player((delta = 0) => {
    rawDeltaSec = delta;
  });

  // Protected Player with 100ms delta clamp
  protectedPlayer = new Player((delta = 0) => {
    clampedDeltaSec = delta;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const isDark = document.documentElement.classList.contains('dark');

    const startX = 50;
    const wallX = w - 120;
    const wallWidth = 14;
    const endX = w - 40;
    const radius = 12;

    const lane1Y = h * 0.32;
    const lane2Y = h * 0.72;

    // --- Physics Update: Protected Lane (capDelta = 0.1) ---
    const nextClampedX = clampedPos.x + clampedVel * clampedDeltaSec;
    if (clampedVel > 0 && nextClampedX + radius >= wallX && clampedPos.x + radius <= wallX + wallWidth) {
      clampedPos.x = wallX - radius;
      clampedVel = -Math.abs(clampedVel);
    } else if (clampedVel < 0 && nextClampedX - radius <= startX) {
      clampedPos.x = startX + radius;
      clampedVel = Math.abs(clampedVel);
    } else {
      clampedPos.x = nextClampedX;
    }

    // --- Physics Update: Unclamped Lane ---
    const prevRawX = unclampedPos.x;
    const nextRawX = unclampedPos.x + unclampedVel * rawDeltaSec;

    if (!hasTunneled.value && unclampedVel > 0 && prevRawX + radius < wallX && nextRawX - radius > wallX + wallWidth) {
      // Tunneled straight through the wall!
      hasTunneled.value = true;
      unclampedPos.x = Math.min(nextRawX, endX - radius);
    } else if (!hasTunneled.value && unclampedVel > 0 && nextRawX + radius >= wallX && prevRawX + radius <= wallX + wallWidth) {
      unclampedPos.x = wallX - radius;
      unclampedVel = -Math.abs(unclampedVel);
    } else if (unclampedVel < 0 && nextRawX - radius <= startX) {
      unclampedPos.x = startX + radius;
      unclampedVel = Math.abs(unclampedVel);
    } else if (hasTunneled.value) {
      // Trapped in the hazard zone on the other side of the wall
      if (nextRawX + radius >= endX) {
        unclampedPos.x = endX - radius;
        unclampedVel = -Math.abs(unclampedVel);
      } else if (unclampedVel < 0 && nextRawX - radius <= wallX + wallWidth) {
        unclampedPos.x = wallX + wallWidth + radius;
        unclampedVel = Math.abs(unclampedVel);
      } else {
        unclampedPos.x = nextRawX;
      }
    } else {
      unclampedPos.x = nextRawX;
    }

    // --- Draw Scene ---
    ctx.clearRect(0, 0, w, h);

    // Track guidelines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(startX, lane1Y);
    ctx.lineTo(endX, lane1Y);
    ctx.moveTo(startX, lane2Y);
    ctx.lineTo(endX, lane2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lane labels
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = isDark ? '#999999' : '#666666';
    ctx.fillText('Unclamped (capDelta: 0) — delta spikes freely during lags:', startX, lane1Y - 20);
    ctx.fillText('Protected (capDelta: 0.1) — delta clamped to max 100ms:', startX, lane2Y - 20);

    // Walls
    function drawWall(y) {
      ctx.fillStyle = hasTunneled.value && y === lane1Y ? '#ff5252' : (isDark ? '#475569' : '#94a3b8');
      ctx.beginPath();
      ctx.roundRect(wallX, y - 28, wallWidth, 56, 4);
      ctx.fill();

      // Wall label
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
      ctx.fillText('WALL', wallX - 5, y + 40);
    }
    drawWall(lane1Y);
    drawWall(lane2Y);

    // Hazard zone shading if tunneled in Lane 1
    if (hasTunneled.value) {
      ctx.fillStyle = 'rgba(255, 82, 82, 0.1)';
      ctx.fillRect(wallX + wallWidth, lane1Y - 28, endX - (wallX + wallWidth), 56);
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('TUNNELING ERROR!', wallX + 22, lane1Y - 8);
    }

    // Lane 1 Ball (Unclamped - Orange)
    ctx.beginPath();
    ctx.arc(unclampedPos.x, lane1Y, radius, 0, Math.PI * 2);
    ctx.fillStyle = hasTunneled.value ? '#ff5252' : '#ff9f43';
    ctx.fill();

    // Lane 2 Ball (Clamped - Green)
    ctx.beginPath();
    ctx.arc(clampedPos.x, lane2Y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#38c793';
    ctx.fill();

    // Reactive counter display updates
    unclampedDeltaDisplay.value = (rawDeltaSec * 1000).toFixed(1);
    clampedDeltaDisplay.value = (clampedDeltaSec * 1000).toFixed(1);
  });

  protectedPlayer.capDelta(0.1);

  // Start both loops
  rawPlayer.start();
  protectedPlayer.start();

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    if (rawPlayer) rawPlayer.stop();
    if (protectedPlayer) protectedPlayer.stop();
  });
});
</script>

<template>
  <figure class="loopr-demo">
    <div class="loopr-demo-toolbar">
      <div class="loopr-btn-group">
        <button
          class="loopr-btn action"
          :disabled="isSpiking"
          @click="triggerLagSpike(600)"
        >
          {{ isSpiking ? 'Freezing...' : 'Simulate Lag Spike (600ms)' }}
        </button>
        <button
          class="loopr-btn action"
          :disabled="isSpiking"
          @click="triggerLagSpike(1200)"
        >
          {{ isSpiking ? 'Freezing...' : 'Simulate Tab Freeze (1.2s)' }}
        </button>
        <button class="loopr-btn" @click="resetSimulation">Reset</button>
      </div>

      <div class="loopr-stats">
        <span :class="['loopr-badge', { 'status-stopped': hasTunneled || Number(unclampedDeltaDisplay) > 50 }]">
          Unclamped: <strong>{{ unclampedDeltaDisplay }}ms</strong>
        </span>
        <span class="loopr-badge status-active">
          Clamped: <strong>{{ clampedDeltaDisplay }}ms</strong>
        </span>
        <span v-if="hasTunneled" class="loopr-badge status-stopped">
          ⚠️ Tunneling Glitch!
        </span>
        <span v-else class="loopr-badge status-active">
          🛡️ Stable
        </span>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>

    <figcaption>
      Lag spike protection: Click <strong>Simulate Lag Spike</strong>. Without delta clamping (orange), a 600ms main-thread freeze results in a huge delta step that teleports the ball straight through the wall (tunneling). With <code>player.capDelta(0.1)</code> (green), the frame step is clamped to 100ms, preserving boundary collisions and keeping physics intact.
    </figcaption>
  </figure>
</template>
