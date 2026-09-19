<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Player } from '@1pizzateam/loopr';
import { Vec2, Trigo, Utils } from '@1pizzateam/spock';

const canvasRef = ref(null);
const currentCap = ref(30);
const fpsDisplay = ref(0);
const deltaDisplay = ref(0);
const ticksDisplay = ref(0);

let player = null;
let angle = 0;
let bounceY = 0;
let bounceDirection = 1;
const center = new Vec2();
const satPos = new Vec2();

const caps = [
  { label: '15 FPS', value: 15 },
  { label: '30 FPS', value: 30 },
  { label: '60 FPS', value: 60 },
  { label: 'Uncapped', value: 0 },
];

function setCap(val) {
  currentCap.value = val;
  if (player) {
    player.capFPS(val);
  }
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
    center.setScalar(w / 2, h / 2);
    const isDark = document.documentElement.classList.contains('dark');

    // Update motion with delta
    angle += delta * 2.5; // ~2.5 rad/s
    bounceY += bounceDirection * delta * 80;
    if (bounceY > 40) {
      bounceY = 40;
      bounceDirection = -1;
    } else if (bounceY < -40) {
      bounceY = -40;
      bounceDirection = 1;
    }

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 70, 0, Math.PI * 2);
    ctx.arc(center.x, center.y, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Draw orbiting satellites using Spock Trigo and Vec2
    const orbitR = 70;
    const satCount = 4;
    for (let i = 0; i < satCount; i++) {
      const a = angle + (i * Math.PI * 2) / satCount;
      satPos.setScalar(
        center.x + Trigo.cosine(a) * orbitR,
        center.y + Trigo.sine(a) * orbitR
      );

      ctx.beginPath();
      ctx.arc(satPos.x, satPos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#ff9f43' : '#5b8cff';
      ctx.fill();
    }

    // Draw bouncing central core
    ctx.beginPath();
    ctx.arc(center.x, center.y + bounceY * 0.4, 20, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#ffffff' : '#333333';
    ctx.fill();

    // Update reactive counters
    fpsDisplay.value = Math.round(player.getFPS());
    deltaDisplay.value = (delta * 1000).toFixed(1);
    ticksDisplay.value = player.getTicks();
  });

  player.capFPS(currentCap.value);
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
          v-for="cap in caps"
          :key="cap.value"
          :class="['loopr-btn', { active: currentCap === cap.value }]"
          @click="setCap(cap.value)"
        >
          {{ cap.label }}
        </button>
      </div>

      <div class="loopr-stats">
        <span class="loopr-badge">FPS: <strong>{{ fpsDisplay }}</strong></span>
        <span class="loopr-badge">Delta: <strong>{{ deltaDisplay }} ms</strong></span>
        <span class="loopr-badge">Ticks: <strong>{{ ticksDisplay }}</strong></span>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>

    <figcaption>
      Interactive frame capping with <code>player.capFPS(fps)</code>. Notice how motion remains temporally smooth while CPU workload and draw cycles are throttled.
    </figcaption>
  </figure>
</template>
