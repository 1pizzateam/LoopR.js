<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { startCanvas } from '../canvas.js';
import { drawLogo } from '../logo.js';

const canvas = ref(null);
let stop = null;

onMounted(() => {
  stop = startCanvas(canvas.value, drawLogo);
});

onBeforeUnmount(() => {
  stop?.();
});
</script>

<template>
  <canvas ref="canvas" class="loopr-logo" aria-label="LoopR.js animation loop logo"></canvas>
</template>
