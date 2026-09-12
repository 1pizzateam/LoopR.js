<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Player } from '@1pizzateam/loopr';

const canvasRef = ref(null);
const isThrottled = ref(false);
const fpsDisplay = ref(60);

let player = null;
let fixedX = 50;
let deltaX = 50;
const speedPxPerSec = 140;

function toggleThrottle() {
  isThrottled.value = !isThrottled.value;
  if (player) {
    player.capFPS(isThrottled.value ? 15 : 60);
  }
}

function resetRunners() {
  fixedX = 50;
  deltaX = 50;
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

  player = new Player((delta = 0) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const isDark = document.documentElement.classList.contains('dark');
    const laneWidth = w - 100;

    // Fixed step (assumes fixed 60 FPS, adds speed / 60 each frame)
    fixedX += (speedPxPerSec / 60);
    if (fixedX > w - 50) fixedX = 50;

    // Delta step (true time-based calculation)
    deltaX += speedPxPerSec * delta;
    if (deltaX > w - 50) deltaX = 50;

    // Clear
    ctx.clearRect(0, 0, w, h);

    const lane1Y = h * 0.35;
    const lane2Y = h * 0.70;

    // Draw lanes
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(50, lane1Y);
    ctx.lineTo(w - 50, lane1Y);
    ctx.moveTo(50, lane2Y);
    ctx.lineTo(w - 50, lane2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lane Labels
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = isDark ? '#999999' : '#666666';
    ctx.fillText('Fixed step (no delta) — slows down when FPS drops:', 50, lane1Y - 18);
    ctx.fillText('With LoopR delta — preserves exact physical speed:', 50, lane2Y - 18);

    // Runner 1 (Fixed)
    ctx.beginPath();
    ctx.arc(fixedX, lane1Y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9f43';
    ctx.fill();

    // Runner 2 (Delta)
    ctx.beginPath();
    ctx.arc(deltaX, lane2Y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#38c793';
    ctx.fill();

    fpsDisplay.value = Math.round(player.getFPS());
  });

  player.capFPS(60);
  player.start();

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    if (player) {
      player.stop();
      player = null;
    }
  });
});
</script>

<template>
  <figure class="loopr-demo">
    <div class="loopr-demo-toolbar">
      <div class="loopr-btn-group">
        <button
          :class="['loopr-btn action', { active: isThrottled }]"
          @click="toggleThrottle"
        >
          {{ isThrottled ? 'Restore 60 FPS' : 'Simulate Lag (Drop to 15 FPS)' }}
        </button>
        <button class="loopr-btn" @click="resetRunners">Sync Start</button>
      </div>

      <div class="loopr-stats">
        <span class="loopr-badge">Current FPS: <strong>{{ fpsDisplay }}</strong></span>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>

    <figcaption>
      Frame-rate independence: Click <strong>Simulate Lag</strong> to see how <code>delta</code> (green) maintains its constant real-world speed even when frames drop, whereas frame-based code (orange) loses speed.
    </figcaption>
  </figure>
</template>
