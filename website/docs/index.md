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
    details: Built-in clock provides accurate delta time, total time, and FPS calculation.
  - icon: 🛑
    title: Frame Capping
    details: Cap maximum FPS if you don't need the browser's maximum refresh rate.
  - icon: 🧩
    title: Modular Design
    details: Use the Player or import the Clock independently for your own use cases.
---

```js
import { Player } from '@1pizzateam/loopr';

let x = 0;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const animation = new Player(() => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update state using delta time
  x += 50 * animation.getTick(); // move 50 pixels per second
  if (x > canvas.width) x = 0;
  
  // Render
  ctx.fillStyle = '#5b8cff';
  ctx.fillRect(x, 100, 50, 50);
});

// Optional: cap at 30 FPS
animation.capFPS(30);

// Start the loop!
animation.start();
```
