import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const docsRoot = path.resolve(root, 'website/docs/api');

const modules = [
  ['Player', 'player.ts', 'player.md'],
  ['Clock', 'clock.ts', 'clock.md'],
];

const intros = {
  Player: {
    summary: 'The main animation frame request controller.',
    body: [
      '`Player` wraps browser `requestAnimationFrame` and orchestrates render loops with a high-precision internal clock, frame rate capping, delta tracking, and play/pause controls.',
    ],
    example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player((delta) => {\n  console.log(\`Render frame delta: \${delta}s\`);\n});\n\nplayer.start();`,
    members: {
      constructor: {
        description: 'Create a new `Player` instance with an animation callback.',
        params: [
          '- `callback` — `(delta?: number) => boolean | void`. The render function executed on every animation frame. It receives the delta time in seconds. Return `false` to automatically stop the loop.',
        ],
        returns: 'A new `Player` instance.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player((delta) => {\n  box.x += speed * delta;\n});\n\n// Self-stopping loop\nlet progress = 0;\nconst transition = new Player((delta) => {\n  progress += delta;\n  if (progress >= 1.0) {\n    return false; // Automatically stops the animation\n  }\n});\ntransition.start();`,
      },
      capFPS: {
        description: 'Cap the maximum frame rate of the animation loop.',
        params: [
          '- `maxFPS` — `number`. Target maximum frames per second (e.g. `30` or `60`). Pass `0` to remove the limit and run at the screen\'s maximum refresh rate.',
        ],
        returns: '`void`',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(() => {\n  render();\n});\n\n// Cap animation to 30 FPS to save battery or CPU\nplayer.capFPS(30);\nplayer.start();\n\n// Later, uncap to run at full display refresh rate\nplayer.capFPS(0);`,
      },
      getTick: {
        description: 'Get the duration of the current frame in seconds.',
        returns: '`number` — Frame delta time in seconds.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nlet position = 0;\nconst speed = 100; // 100 pixels per second\n\nconst player = new Player(() => {\n  const dt = player.getTick();\n  position += speed * dt;\n  element.style.transform = \`translateX(\${position}px)\`;\n});\n\nplayer.start();`,
      },
      getTime: {
        description: 'Get the total active animation time elapsed in seconds since start.',
        returns: '`number` — Cumulative active time in seconds (excluding paused periods).',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(() => {\n  const elapsed = player.getTime();\n  element.style.opacity = (Math.sin(elapsed * 2) + 1) / 2;\n});\n\nplayer.start();`,
      },
      getFPS: {
        description: 'Get the moving average frames per second calculated over the last 60 frames.',
        returns: '`number` — Average frame rate.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst fpsDisplay = document.getElementById('fps-counter');\n\nconst player = new Player(() => {\n  renderScene();\n  fpsDisplay.textContent = \`\${Math.round(player.getFPS())} FPS\`;\n});\n\nplayer.start();`,
      },
      getTicks: {
        description: 'Get the total number of frames (ticks) rendered since the player started.',
        returns: '`number` — Total frame count.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(() => {\n  renderScene();\n  if (player.getTicks() % 100 === 0) {\n    console.log(\`Rendered \${player.getTicks()} frames\`);\n  }\n});\n\nplayer.start();`,
      },
      isActive: {
        description: 'Check whether the animation loop is currently active and running.',
        returns: '`boolean` — `true` if the loop is running, `false` if paused or stopped.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(render);\nconsole.log(player.isActive()); // false\n\nplayer.start();\nconsole.log(player.isActive()); // true\n\nplayer.pause();\nconsole.log(player.isActive()); // false`,
      },
      setScope: {
        description: 'Bind a custom `this` context to the animation callback function.',
        params: [
          '- `scope` — `object`. The context object to bind as `this` inside the callback.',
        ],
        returns: '`void`',
        example: `import { Player } from '@1pizzateam/loopr';\n\nclass GameScene {\n  constructor() {\n    this.playerCount = 4;\n    this.player = new Player(this.render);\n    this.player.setScope(this);\n  }\n\n  render(delta) {\n    console.log(\`Rendering scene for \${this.playerCount} players, delta: \${delta}\`);\n  }\n\n  start() {\n    this.player.start();\n  }\n}\n\nconst scene = new GameScene();\nscene.start();`,
      },
      start: {
        description: 'Start the animation loop.',
        returns: '`boolean` — `true` if the animation was successfully started, `false` if it was already running.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(draw);\nconst started = player.start();\nconsole.log(started); // true\n\n// Calling start() again while already active returns false\nconsole.log(player.start()); // false`,
      },
      toggle: {
        description: 'Toggle playback between running and paused states.',
        returns: '`boolean` — `true` if the player started playing, `false` if it was paused.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(draw);\nplayer.start();\n\nwindow.addEventListener('keydown', (event) => {\n  if (event.code === 'Space') {\n    const isPlaying = player.toggle();\n    console.log(isPlaying ? 'Resumed' : 'Paused');\n  }\n});`,
      },
      pause: {
        description: 'Pause the animation loop without resetting elapsed time or tick counts.',
        returns: '`boolean` — `true` if the player was running and was paused, `false` if it was already paused or stopped.',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(render);\nplayer.start();\n\ndocument.addEventListener('visibilitychange', () => {\n  if (document.hidden) {\n    player.pause();\n  } else {\n    player.start();\n  }\n});`,
      },
      stop: {
        description: 'Stop the animation loop and reset the internal clock (delta, elapsed time, and tick counts are reset to zero).',
        returns: '`void`',
        example: `import { Player } from '@1pizzateam/loopr';\n\nconst player = new Player(render);\nplayer.start();\n\nstopButton.addEventListener('click', () => {\n  player.stop();\n  console.log(player.getTime());  // 0\n  console.log(player.getTicks()); // 0\n});`,
      },
    },
  },
  Clock: {
    summary: 'A high precision internal clock for the Player.',
    body: [
      '`Clock` provides precise timing tracking for animations, calculating delta times between frames, cumulative elapsed time, and running average FPS over a circular buffer.',
    ],
    example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start();\n\nfunction render() {\n  const now = performance.now();\n  const delta = clock.computeDelta(now);\n  clock.tick(now);\n\n  console.log(\`Delta: \${delta}ms, Average FPS: \${clock.computeAverageFPS()}\`);\n  requestAnimationFrame(render);\n}\n\nrequestAnimationFrame(render);`,
    members: {
      constructor: {
        description: 'Create a new `Clock` instance initialized to zero state.',
        returns: 'A new `Clock` instance.',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nconsole.log(clock.ticks); // 0\nconsole.log(clock.total); // 0\nconsole.log(clock.delta); // 0`,
      },
      reset: {
        description: 'Reset the clock state back to initial values (`now = 0`, `total = 0`, `delta = 0`, `ticks = 0`, and resets the FPS circular buffer).',
        returns: '`void`',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start();\n\n// Later, reset all timing metrics\nclock.reset();\nconsole.log(clock.ticks); // 0\nconsole.log(clock.total); // 0\nconsole.log(clock.delta); // 0`,
      },
      start: {
        description: 'Initialize the clock\'s starting timestamp to the current high-resolution time.',
        returns: '`void`',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start(); // captures performance.now()`,
      },
      tick: {
        description: 'Advance the clock state to the specified timestamp. Updates `now`, accumulates `total` time, records the instantaneous FPS into the circular buffer, and increments `ticks`.',
        params: [
          '- `now` — `number`. Current timestamp in milliseconds.',
        ],
        returns: '`void`',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start();\n\nfunction loop(timestamp) {\n  clock.computeDelta(timestamp);\n  clock.tick(timestamp);\n  console.log(\`Ticks: \${clock.ticks}, Total time: \${clock.total}ms\`);\n  requestAnimationFrame(loop);\n}\n\nrequestAnimationFrame(loop);`,
      },
      computeDelta: {
        description: 'Calculate the delta time in milliseconds between the given timestamp and the previous recorded timestamp.',
        params: [
          '- `now` — `number`. Current timestamp in milliseconds (typically from `performance.now()` or `requestAnimationFrame` callback).',
        ],
        returns: '`number` — Elapsed duration in milliseconds since the last tick or start.',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start();\n\nfunction loop(timestamp) {\n  const delta = clock.computeDelta(timestamp);\n  console.log(\`Elapsed since last frame: \${delta}ms\`);\n  clock.tick(timestamp);\n  requestAnimationFrame(loop);\n}\n\nrequestAnimationFrame(loop);`,
      },
      computeAverageFPS: {
        description: 'Calculate the moving average frames per second from the internal 60-frame buffer.',
        returns: '`number` — Moving average FPS.',
        example: `import { Clock } from '@1pizzateam/loopr';\n\nconst clock = new Clock();\nclock.start();\n\nfunction loop(timestamp) {\n  clock.computeDelta(timestamp);\n  clock.tick(timestamp);\n  const fps = clock.computeAverageFPS();\n  fpsElement.textContent = \`FPS: \${Math.round(fps)}\`;\n  requestAnimationFrame(loop);\n}\n\nrequestAnimationFrame(loop);`,
      },
    },
  },
};

function jsDoc(node, source) {
  const ranges = ts.getLeadingCommentRanges(source.text, node.getFullStart()) ?? [];
  const comment = ranges
    .map(range => source.text.slice(range.pos, range.end))
    .reverse()
    .find(value => value.startsWith('/**'));
  return comment
    ? comment.replace(/^\/\*\*\s?|\s?\*\/$/g, '').replace(/^\s*\*\s?/gm, '').trim()
    : '';
}

function parameterInfo(parameter, source) {
  return {
    name: parameter.name.getText(source),
    type: parameter.type?.getText(source) ?? 'unknown',
    optional: Boolean(parameter.questionToken || parameter.initializer),
  };
}

function publicApi(exportName, sourcePath) {
  const text = fs.readFileSync(sourcePath, 'utf8');
  const source = ts.createSourceFile(sourcePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const entries = [];

  for (const statement of source.statements) {
    if (ts.isClassDeclaration(statement) && statement.name?.text === exportName) {
      for (const member of statement.members) {
        if (member.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword)) continue;
        if (ts.isConstructorDeclaration(member)) {
          entries.push({
            name: 'constructor',
            signature: `new ${exportName}(${member.parameters.map(p => p.getText(source)).join(', ')})`,
            params: member.parameters.map(p => parameterInfo(p, source)),
            returns: exportName,
            description: jsDoc(member, source),
          });
        } else if (ts.isMethodDeclaration(member) && member.name) {
          const name = member.name.getText(source);
          const returns = member.type?.getText(source) ?? 'void';
          entries.push({
            name,
            signature: `${name}(${member.parameters.map(p => p.getText(source)).join(', ')}): ${returns}`,
            params: member.parameters.map(p => parameterInfo(p, source)),
            returns,
            description: jsDoc(member, source),
          });
        }
      }
      return entries;
    }
  }
  return entries;
}

for (const [exportName, sourceFile, docFile] of modules) {
  const api = publicApi(exportName, path.join(root, 'src', sourceFile));
  const intro = intros[exportName];
  let markdown = `# ${exportName}

${intro.summary}

${intro.body.join('\n\n')}

\`\`\`javascript
${intro.example}
\`\`\`
`;

  if (exportName === 'Clock') {
    markdown += `
## Properties

- \`ticks\` — \`number\`. Total frame tick counter (default \`0\`).
- \`total\` — \`number\`. Total elapsed time accumulated across ticks in milliseconds.
- \`delta\` — \`number\`. Duration between the last two frames in milliseconds.
`;
  }

  for (const entry of api) {
    const meta = intro.members?.[entry.name] || {};
    const title = entry.name === 'constructor' ? '## Constructor' : `## ${exportName}.${entry.name}()`;
    markdown += `
---

${title}

${meta.description || entry.description || ''}

\`\`\`typescript
${entry.signature}
\`\`\`
`;

    if (meta.params?.length) {
      markdown += `
### Parameters

${meta.params.join('\n')}
`;
    }

    if (meta.returns) {
      markdown += `
### Returns

${meta.returns}
`;
    }

    if (meta.example) {
      markdown += `
### Example

\`\`\`javascript
${meta.example}
\`\`\`
`;
    }
  }

  fs.writeFileSync(path.join(docsRoot, docFile), markdown.trimStart());
}
console.log('Documentation generated successfully with code usage samples.');
