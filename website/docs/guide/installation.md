# Installation

LoopR.js requires Node.js 22 or newer and is published as an ES module.

## npm

```bash
npm install @1pizzateam/loopr
```

## Yarn

```bash
yarn add @1pizzateam/loopr
```

## Usage

Import only the APIs you need:

```js
import { Player, Clock } from '@1pizzateam/loopr';

const player = new Player((delta) => {
  console.log(`Frame tick delta: ${delta}s`);
});

player.capFPS(60);
player.capDelta(0.1); // clamp lag spikes to max 100ms
player.start();
```

LoopR.js has no CommonJS or IIFE build. Browser projects should load it through an ESM-aware bundler or use a module script.

```html
<script type="module">
  import { Player } from './node_modules/@1pizzateam/loopr/dist/loopr.js';

  const player = new Player(() => {
    // render logic
  });
  player.start();
</script>
```
