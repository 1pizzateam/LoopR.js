<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Player } from '@1pizzateam/loopr';
import { Trigo, Utils } from '@1pizzateam/spock';

const canvasRef = ref(null);
const playbackStatus = ref('running'); // 'running' | 'paused' | 'stopped'
const timeDisplay = ref('0.00');
const ticksDisplay = ref(0);

let player = null;
const margin = 40;
let posX = margin;
let direction = 1;

function drawScene(x, elapsed = 0) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const isDark = document.documentElement.classList.contains('dark');

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Track line
  ctx.beginPath();
  ctx.moveTo(margin, h / 2);
  ctx.lineTo(w - margin, h / 2);
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Pulse effect
  const pulse = 16 + Trigo.sine(elapsed * 6) * 4;

  ctx.beginPath();
  ctx.arc(x, h / 2, pulse, 0, Math.PI * 2);
  ctx.fillStyle = '#5b8cff';
  ctx.shadowColor = 'rgba(91, 140, 255, 0.5)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Center core
  ctx.beginPath();
  ctx.arc(x, h / 2, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

function onStart() {
  if (player) {
    player.start();
    playbackStatus.value = 'running';
  }
}

function onPause() {
  if (player) {
    player.pause();
    playbackStatus.value = 'paused';
  }
}

function onToggle() {
  if (player) {
    const isNowPlaying = player.toggle();
    playbackStatus.value = isNowPlaying ? 'running' : 'paused';
  }
}

function onStop() {
  if (player) {
    player.stop();
    playbackStatus.value = 'stopped';
    posX = margin;
    direction = 1;
    timeDisplay.value = '0.00';
    ticksDisplay.value = 0;
    drawScene(posX, 0);
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
    drawScene(posX, player ? player.getTime() : 0);
  }
  resize();
  window.addEventListener('resize', resize);

  player = new Player((delta = 0) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const speed = 180; // px/s

    posX += direction * speed * delta;
    if (posX >= w - margin) {
      posX = w - margin;
      direction = -1;
    } else if (posX <= margin) {
      posX = margin;
      direction = 1;
    }
    posX = Utils.clamp(posX, margin, w - margin);

    drawScene(posX, player.getTime());

    timeDisplay.value = player.getTime().toFixed(2);
    ticksDisplay.value = player.getTicks();
  });

  player.capFPS(60);
  player.start();
  playbackStatus.value = 'running';

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
        <button class="loopr-btn action" :disabled="playbackStatus === 'running'" @click="onStart">Start</button>
        <button class="loopr-btn action" :disabled="playbackStatus !== 'running'" @click="onPause">Pause</button>
        <button class="loopr-btn action" @click="onToggle">Toggle</button>
        <button class="loopr-btn action danger" :disabled="playbackStatus === 'stopped'" @click="onStop">Stop (Reset)</button>
      </div>

      <div class="loopr-stats">
        <span
          :class="[
            'loopr-badge',
            playbackStatus === 'running'
              ? 'status-active'
              : playbackStatus === 'paused'
                ? 'status-paused'
                : 'status-stopped',
          ]"
        >
          {{ playbackStatus === 'running' ? '● Running' : playbackStatus === 'paused' ? '❚❚ Paused' : '◼ Stopped' }}
        </span>
        <span class="loopr-badge">Time: <strong>{{ timeDisplay }}s</strong></span>
        <span class="loopr-badge">Frames: <strong>{{ ticksDisplay }}</strong></span>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>

    <figcaption>
      Playback lifecycle controls: <code>start()</code>, <code>pause()</code>, <code>toggle()</code>, and <code>stop()</code> with live status queries via <code>isActive()</code> and <code>getTime()</code>.
    </figcaption>
  </figure>
</template>
