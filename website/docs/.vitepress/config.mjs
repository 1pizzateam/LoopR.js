import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.env.NODE_ENV === 'production';

const base = process.env.VITEPRESS_BASE || (production ? '/LoopR.js/' : '/docs/');

const here = path.dirname(fileURLToPath(import.meta.url));

// The live demos import the library by its package name, but it always resolves
// to the local build so the docs demo the current source instead of whatever
// happens to be published. Docker mounts dist/ beside the website; outside Docker
// it sits at the repository root.
function localEntry() {
  const entry = [
    path.resolve(here, '../../dist/loopr.js'),
    path.resolve(here, '../../../dist/loopr.js'),
  ].find(candidate => fs.existsSync(candidate));

  if (!entry)
    throw new Error('Local build not found. Run "npm run build:lib" in the repository root first.');

  return entry;
}

const alias = {
  '@1pizzateam/looprjs': localEntry(),
  '@1pizzateam/loopr': localEntry(),
};

export default defineConfig({
  title: 'LoopR.js',
  description: 'Lightweight animation and render loop manager with FPS capping and delta-time clock.',
  base,
  cleanUrls: true,
  vite: {
    resolve: { alias },
  },
  head: [
    ['meta', { name: 'theme-color', content: '#5b8cff' }],
  ],
  themeConfig: {
    siteTitle: 'LoopR.js',
    nav: [
      { text: 'Guide', link: '/guide/overview' },
      { text: 'Examples', link: '/guide/examples' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Examples', link: '/guide/examples' },
        ],
      },
      {
        text: 'API overview',
        link: '/api/',
      },
      {
        text: 'Core',
        collapsed: false,
        items: [
          { text: 'Player', link: '/api/player' },
          { text: 'Clock', link: '/api/clock' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/1pizzateam/LoopR.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@1pizzateam/loopr' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2011-present 1 Pizza Team',
    },
  },
});
