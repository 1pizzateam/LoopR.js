Version 2.1.0 (September 19th 2026)
-----------------------------
 * Clock:
    * Switched to `RollingAverage` from `@1pizzateam/spock` for $O(1)$ running average calculation without per-frame re-summation
    * Eliminated initial 60 FPS startup bias in `computeAverageFPS()`
    * Standardized monotonic timing with `Time.now()` from `@1pizzateam/spock`
    * Added optional `maxDelta` clamping in `computeDelta()` using `Time.clampDelta()`
 * Player:
    * Added `capDelta(maxSeconds)` to clamp maximum delta time and protect animations/simulations from lag spikes and tab switching
    * Zero-allocation animation frame dispatch (removed per-call `.bind(window)` in `requestNewFrame()` and `cancelFrame()`)
    * Added guard clause to `computeNewFrame()` to immediately ignore ticks when stopped/inactive
 * Dependencies:
    * Upgraded `@1pizzateam/spock` to version 4.1.0

Version 2.0.0 (September 12th 2026)
-----------------------------
 * Library rebranded and modernized as @1pizzateam/loopr
 * Exported as native ES module with TypeScript declarations
 * Upgraded dependencies to @dwtechs/checkard (3.7.0) and @1pizzateam/spock (4.0.0)
 * Optimized rendering performance by pre-binding animation frame handler to eliminate per-frame GC heap allocations
 * Added safe fallback for window/requestAnimationFrame to support SSR, Web Workers, and Node.js
 * Added isActive() method to Player to query loop state
 * Exported PlayerCallback type with optional delta parameter
 * Passed current delta in seconds to the callback function
 * Added validation to capFPS() to prevent negative framerate durations
 * Fixed hardcoded buffer length modulo in Clock.tick()
 * Reset frameId to 0 upon animation cancellation
 * Modernized testing infrastructure with Jest ESM and 100% test coverage

Version 1.1.0 (October 2nd 2021)
-----------------------------
 * Better API methods names
 * Documentation update

Version 1.0.1 (May 14th 2020)
-----------------------------
 * Type6js dependency update to version 2.0.1

Version 1.0.0 (January 03th 2019)
-----------------------------
 * Library name is now FrameRat on IIFE version
 * play() method replaced by start() method
 * Delete logger dependency

Version 0.4.1 (October 5th 2019)
-----------------------------
 * Fix setScope() method
 * Dependencies update

Version 0.4.0 (September 15th 2019)
-----------------------------
 * Callback function can return false to trigger stop() method

Version 0.3.10 (September 14th 2019)
-----------------------------
 * Add setMaxRefreshRate() method
 * Add getState() method

Version 0.3.9 (September 9th 2019)
-----------------------------
 * Add getTicks() method to Player class

Version 0.3.8 (June 28th 2019)
-----------------------------
 * Update Mouette logger for log groups management

Version 0.3.7 (June 22th 2019)
-----------------------------
 * Fix setScope() method
 * RefreshRate parameter can be null

Version 0.3.6 (June 20th 2019)
-----------------------------
 * Fix declaration file

Version 0.3.5 (October 08th 2018)
-----------------------------
 * FrameRat.js published on NPM at @lcluber/frameratjs
 * README.md Updated with NPM installation procedure

Version 0.3.4 (July 15th 2018)
------------------------------
 * Library exported as ES6 and IIFE modules instead of UMD
 * FRAMERAT namespace becomes Framerat

Version 0.3.3 (July 4th 2018)
------------------------------
 * Documentation automatically generated in /doc folder
 * Typedoc and grunt-typedoc added in devDependencies
 * New "typedoc" task in Gruntfile.js
 * Typescript upgraded to version 2.9.2
 * INSTALL.md becomes NOTICE.md and RELEASE_NOTES.md becomes CHANGELOG.md

Version 0.3.2 (May 30th 2018)
------------------------------
 * Add getters getDelta(), getTotal(), getFPS()

Version 0.3.1 (March 18th 2018)
------------------------------
 * Update Type6.js dependency to version 0.4.3
 * Update Taipan.js dependency to version 0.3.2
 * Utils class deleted. Now using Type6.js Time utility functions
 * Add logs with Mouette.js

Version 0.3.0 (March 12th 2018)
------------------------------
 * Library is written in TypeScript
 * Update Type6.js dependency to version 0.4.1
 * Update Taipan.js dependency to version 0.3.1

Version 0.2.8 (May 3rd 2017)
------------------------------
 * stop() method now initializes clock and tick count even if pause() method returns false

Version 0.2.7 (April 2nd 2017)
------------------------------
 * Add Time class to handle time formats properly in seconds and milliseconds
 * elapsed and delta in the clock method are now Time classes

Version 0.2.6 (February 18th 2017)
------------------------------
 * Type6.js and Taipan.js dependencies not inserted into the distribution FrameRat.js and FrameRat.min.js files anymore

Version 0.2.5 (January 30th 2017)
------------------------------
 * Update Type6.js dependency to version 0.2.3

Version 0.2.4 (January 29th 2017)
------------------------------
 * Fix console bug when using several instances of FrameRat.js

Version 0.2.3 (January 28th 2017)
------------------------------
 * Add a console to display frame rate information on the canvas
 * New drawConsole() method to draw the console on the canvas when needed
 * New toggleConsole() method to show or hide the console on the canvas
 * Simplified clock class
 * The callback's scope is now passed on creation rather than in the new frame request
 * Add Type6.js dependency

Version 0.2.2 (January 10th 2017)
------------------------------
 * Add toggle() method to toggle between play and pause states
 * play(), pause() and stop() methods now return a boolean

Version 0.2.1 (October 15th 2016)
------------------------------
 * Add performance.now() polyfill
 * Uses performance.now instead of Date.getTime() for better performances
 * Add Time class
 * Add getRoundedDelta() method

Version 0.2.0 (September 21st 2016)
------------------------------
 * Update for open source release on GitHub
 * Code reworked
 * Dedicated website
 * Documentation
 * Examples

Version 0.1.0 (December 1st 2011)
-----------------------------
 * initial version
