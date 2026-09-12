function reducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Draw the homepage mark: an animated loop icon with orbiting harmonic rings,
 * pulsing core, and orbital dots driven by LoopR's Player timing.
 */
export function drawLogo(context, state, theme) {
  const { width, height } = state;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const radius = Math.min(width, height) * 0.38;

  if (radius <= 0) return;

  const t = reducedMotion() ? 1.0 : state.time;

  const centerX = cx;
  const centerY = cy;

  // Outer ambient glow ring
  context.save();
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.strokeStyle = theme.dark ? 'rgba(91, 140, 255, 0.12)' : 'rgba(91, 140, 255, 0.15)';
  context.lineWidth = 1.5;
  context.stroke();

  // Tick markers around the outer ring (like a precision stopwatch clock)
  const numTicks = 24;
  for (let i = 0; i < numTicks; i++) {
    const angle = (i / numTicks) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const innerR = radius - (isMajor ? 10 : 5);
    const outerR = radius;

    const x1 = centerX + Math.cos(angle) * innerR;
    const y1 = centerY + Math.sin(angle) * innerR;
    const x2 = centerX + Math.cos(angle) * outerR;
    const y2 = centerY + Math.sin(angle) * outerR;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = isMajor ? theme.accent : (theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)');
    context.lineWidth = isMajor ? 2 : 1;
    context.stroke();
  }

  // Dual intertwined orbiting arcs (LoopR symbol)
  const rings = [
    { r: radius * 0.78, speed: 1.2, length: Math.PI * 1.1, color: theme.accent, width: 3.5 },
    { r: radius * 0.58, speed: -0.9, length: Math.PI * 0.9, color: theme.warm || '#ff9f43', width: 3 },
    { r: radius * 0.38, speed: 1.8, length: Math.PI * 0.7, color: theme.fresh || '#38c793', width: 2.5 },
  ];

  rings.forEach((ring, idx) => {
    const startAngle = t * ring.speed;
    const endAngle = startAngle + ring.length;

    // Track circle
    context.beginPath();
    context.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
    context.strokeStyle = theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    context.lineWidth = 1;
    context.stroke();

    // Active moving arc
    context.beginPath();
    context.arc(centerX, centerY, ring.r, startAngle, endAngle);
    context.strokeStyle = ring.color;
    context.lineWidth = ring.width;
    context.lineCap = 'round';
    context.stroke();

    // Orbiting particle at the leading edge (in front according to rotation direction)
    const leadAngle = ring.speed >= 0 ? endAngle : startAngle;
    const leadX = centerX + Math.cos(leadAngle) * ring.r;
    const leadY = centerY + Math.sin(leadAngle) * ring.r;

    context.beginPath();
    context.arc(leadX, leadY, ring.width + 1.5, 0, Math.PI * 2);
    context.fillStyle = ring.color;
    context.fill();

    // Glow halo around the head particle
    context.beginPath();
    context.arc(leadX, leadY, ring.width + 5, 0, Math.PI * 2);
    context.fillStyle = ring.color;
    context.globalAlpha = 0.25;
    context.fill();
    context.globalAlpha = 1.0;
  });

  // Center pulsating clock core
  const pulse = Math.sin(t * 3) * 0.15 + 1.0;
  const coreRadius = radius * 0.16 * pulse;

  const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 1.5);
  gradient.addColorStop(0, theme.accent);
  gradient.addColorStop(0.7, theme.dark ? 'rgba(91, 140, 255, 0.6)' : 'rgba(91, 140, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(91, 140, 255, 0)');

  context.beginPath();
  context.arc(centerX, centerY, coreRadius * 1.5, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  context.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
  context.fillStyle = theme.surface;
  context.fill();
  context.strokeStyle = theme.accent;
  context.lineWidth = 2;
  context.stroke();

  context.restore();
}
