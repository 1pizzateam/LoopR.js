import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import LoopRLogo from './components/LoopRLogo.vue';
import FpsCapDemo from './components/FpsCapDemo.vue';
import ControlsDemo from './components/ControlsDemo.vue';
import DeltaMotionDemo from './components/DeltaMotionDemo.vue';
import SelfStoppingDemo from './components/SelfStoppingDemo.vue';
import DeltaClampDemo from './components/DeltaClampDemo.vue';
import './demo.css';

export default {
  extends: DefaultTheme,
  // The homepage mark is the library drawing itself, so it stands in for the hero image
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(LoopRLogo),
    });
  },
  enhanceApp({ app }) {
    app.component('LoopRLogo', LoopRLogo);
    app.component('FpsCapDemo', FpsCapDemo);
    app.component('ControlsDemo', ControlsDemo);
    app.component('DeltaMotionDemo', DeltaMotionDemo);
    app.component('SelfStoppingDemo', SelfStoppingDemo);
    app.component('DeltaClampDemo', DeltaClampDemo);
  },
};
