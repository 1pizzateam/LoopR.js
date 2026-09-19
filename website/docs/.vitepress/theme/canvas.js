import { Player } from '@1pizzateam/loopr';

/** Shared cap for the logo and every interactive example. */
export const CANVAS_FPS_CAP = 30;

/** Colors that track the active VitePress color scheme. */
export function palette() {
  const dark = document.documentElement.classList.contains('dark');
  return {
    dark,
    surface: dark ? '#1b1b1f' : '#ffffff',
    grid: dark ? '#2e2e32' : '#eceef1',
    guide: dark ? '#4a4a52' : '#c6cad1',
    text: dark ? '#c9c9cd' : '#3c3c43',
    accent: '#5b8cff',
    warm: '#ff9f43',
    fresh: '#38c793',
  };
}

/**
 * Run draw() through LoopR with a device-pixel-ratio aware context.
 * The Player clock preserves animation speed, computes delta time and rolling FPS,
 * while capFPS limits redraw work and capDelta clamps lag spikes.
 * Returns a teardown function with the active Player instance attached.
 */
export function startCanvas(canvas, draw, { fps = CANVAS_FPS_CAP, maxDelta = 0.1 } = {}) {
  const context = canvas.getContext('2d');
  const state = {
    width: 0,
    height: 0,
    time: 0,
    delta: 0,
    fps: 0,
    ticks: 0,
    pointer: null,
  };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    state.width = width;
    state.height = height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function movePointer(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function clearPointer() {
    state.pointer = null;
  }

  const animation = new Player((delta) => {
    state.delta = delta ?? animation.getTick();
    state.time = animation.getTime();
    state.fps = animation.getFPS();
    state.ticks = animation.getTicks();
    context.clearRect(0, 0, state.width, state.height);
    draw(context, state, palette());
  });

  if (fps) animation.capFPS(fps);
  if (maxDelta) animation.capDelta(maxDelta);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) animation.start();
    else animation.pause();
  });
  visibilityObserver.observe(canvas);
  canvas.addEventListener('pointermove', movePointer);
  canvas.addEventListener('pointerleave', clearPointer);

  resize();
  animation.start();

  const teardown = () => {
    animation.stop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    canvas.removeEventListener('pointermove', movePointer);
    canvas.removeEventListener('pointerleave', clearPointer);
  };
  teardown.player = animation;

  return teardown;
}

/** Stroke a polyline through the given [x, y] pairs. */
export function polyline(context, points, color, width = 2) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++)
    context.lineTo(points[i][0], points[i][1]);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

/** Fill a small disc, optionally ringed for emphasis. */
export function dot(context, x, y, radius, color, ring) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.fillStyle = color;
  context.fill();
  if (ring) {
    context.strokeStyle = ring;
    context.lineWidth = 2;
    context.stroke();
  }
}

/** Draw a caption in the top-left corner. */
export function label(context, text, color, x = 12, y = 20) {
  context.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.fillStyle = color;
  context.fillText(text, x, y);
}
