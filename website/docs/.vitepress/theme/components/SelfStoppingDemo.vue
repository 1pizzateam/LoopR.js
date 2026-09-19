<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Player } from '@1pizzateam/loopr';
import { Utils } from '@1pizzateam/spock';

const canvasRef = ref(null);
const progressPercent = ref(0);
const isComplete = ref(false);
const isRunning = ref(false);

let player = null;
let progress = 0;
const totalDuration = 2.5; // seconds to complete 100%

function restart() {
  progress = 0;
  progressPercent.value = 0;
  isComplete.value = false;

  if (player) {
    player.stop();
  }

  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  player = new Player((delta = 0) => {
    progress = Utils.clamp(progress + delta / totalDuration, 0, 1.0);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    const isDark = document.documentElement.classList.contains('dark');

    // Check stop condition
    const shouldStop = progress >= 1.0;
    progressPercent.value = Math.round(progress * 100);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = shouldStop ? '#38c793' : '#5b8cff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Text in center
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = isDark ? '#ffffff' : '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${progressPercent.value}%`, cx, cy);

    if (shouldStop) {
      isComplete.value = true;
      isRunning.value = false;
      return false; // Tells LoopR to stop automatically!
    }
  });

  player.capFPS(60);
  player.start();
  isRunning.value = true;
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

  restart();

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
        <button class="loopr-btn action" @click="restart">
          {{ isComplete ? 'Replay Animation' : 'Restart' }}
        </button>
      </div>

      <div class="loopr-stats">
        <span :class="['loopr-badge', isComplete ? 'status-complete' : 'status-active']">
          {{ isComplete ? '✓ Stopped automatically' : '● Progressing...' }}
        </span>
        <span class="loopr-badge">Progress: <strong>{{ progressPercent }}%</strong></span>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>

    <figcaption>
      Self-stopping loops: Returning <code>false</code> inside the callback terminates the loop automatically without needing an external <code>player.stop()</code> call.
    </figcaption>
  </figure>
</template>
