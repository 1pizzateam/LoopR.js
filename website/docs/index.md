---
layout: home

hero:
  name: LoopR.js
  text: Animation Loops for JavaScript
  tagline: A lightweight animation and render loop manager with built-in high precision clock and FPS capping.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/overview
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: 🔄
    title: requestAnimationFrame Wrapper
    details: Cleanly manage and orchestrate your render loops without repetitive boilerplate.
  - icon: ⏱️
    title: High Precision Clock
    details: Built-in clock provides accurate delta time, total time, and running average FPS.
  - icon: 🛑
    title: Frame Capping & Delta Clamping
    details: Cap maximum FPS or clamp maximum delta duration to shield simulations against lag spikes.
  - icon: 🧩
    title: Modular Design
    details: Use the Player or import the Clock independently for your own animation loops.
---

```js
import { Player } from '@1pizzateam/loopr';
import { Vec2 } from '@1pizzateam/spock';

const position = new Vec2(0, 100);
const speed = 50; // move 50 pixels per second
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const animation = new Player((delta) => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update state using delta time
  position.x += speed * delta;
  if (position.x > canvas.width) position.x = 0;
  
  // Render
  ctx.fillStyle = '#5b8cff';
  ctx.fillRect(position.x, position.y, 50, 50);
});

// Optional: cap at 30 FPS
animation.capFPS(30);

// Start the loop!
animation.start();
```
