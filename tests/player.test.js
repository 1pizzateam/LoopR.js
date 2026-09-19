import { jest } from '@jest/globals';
import { Player } from '../build/es6/player.js';

describe('Player', () => {
  let player;
  let callback;
  let rafCallbacks;
  let nextFrameId;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextFrameId = 1;
    global.window = {
      requestAnimationFrame: jest.fn((cb) => {
        const id = nextFrameId++;
        rafCallbacks.set(id, cb);
        return id;
      }),
      cancelAnimationFrame: jest.fn((id) => {
        rafCallbacks.delete(id);
      }),
    };
    callback = jest.fn();
    player = new Player(callback);
  });

  afterEach(() => {
    delete global.window;
  });

  it('should initialize with default state', () => {
    expect(player.frameId).toBe(0);
    expect(player.getTicks()).toBe(0);
    expect(player.getTime()).toBe(0);
    expect(player.getTick()).toBe(0);
    expect(player.getFPS()).toBe(0);
  });

  it('should start animation', () => {
    const started = player.start();
    expect(started).toBe(true);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(player.start()).toBe(false);
  });

  it('should toggle play and pause', () => {
    expect(player.toggle()).toBe(true);
    expect(player.toggle()).toBe(false);
  });

  it('should pause animation when active', () => {
    expect(player.pause()).toBe(false);
    player.start();
    expect(player.pause()).toBe(true);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should stop animation and reset clock', () => {
    player.start();
    player.stop();
    expect(player.getTicks()).toBe(0);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should cap FPS', () => {
    player.capFPS(30);
    player.capFPS('invalid');
  });

  it('should execute callback on animation frame', () => {
    player.start();
    const frameId = player.frameId;
    const rafCb = rafCallbacks.get(frameId);
    expect(typeof rafCb).toBe('function');
    rafCb(100);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(player.getTicks()).toBe(1);
  });

  it('should stop animation if callback returns false', () => {
    const stoppingCallback = jest.fn(() => false);
    const p = new Player(stoppingCallback);
    p.start();
    const frameId = p.frameId;
    const rafCb = rafCallbacks.get(frameId);
    rafCb(100);
    expect(stoppingCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle stop when inactive', () => {
    player.stop();
    expect(player.getTicks()).toBe(0);
  });

  it('should skip frame if delta is less than frameMinDuration when capped', () => {
    player.capFPS(30);
    player.start();
    const frameId = player.frameId;
    const rafCb = rafCallbacks.get(frameId);

    jest.spyOn(player['clock'], 'computeDelta').mockReturnValue(10);
    rafCb(100);

    expect(callback).not.toHaveBeenCalled();
    expect(player.getTicks()).toBe(0);
  });

  it('should execute frame if delta is greater than or equal to frameMinDuration when capped', () => {
    player.capFPS(30);
    player.start();
    const frameId = player.frameId;
    const rafCb = rafCallbacks.get(frameId);

    jest.spyOn(player['clock'], 'computeDelta').mockReturnValue(40);
    rafCb(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(player.getTicks()).toBe(1);
  });

  it('should report active state with isActive', () => {
    expect(player.isActive()).toBe(false);
    player.start();
    expect(player.isActive()).toBe(true);
    player.pause();
    expect(player.isActive()).toBe(false);
  });

  it('should pass delta in seconds to callback', () => {
    let receivedDelta = null;
    const p = new Player((delta) => {
      receivedDelta = delta;
    });
    p.start();
    const frameId = p.frameId;
    const rafCb = rafCallbacks.get(frameId);
    jest.spyOn(p['clock'], 'computeDelta').mockImplementation(() => {
      p['clock'].delta = 50;
      return 50;
    });
    rafCb(100);
    expect(receivedDelta).toBeCloseTo(0.05);
  });

  it('should ignore negative FPS values in capFPS', () => {
    player.capFPS(60);
    player.capFPS(-30);
    expect(player['frameMinDuration']).toBeCloseTo(16.666, 1);
  });

  it('should cap delta time with capDelta', () => {
    player.capDelta(0.1);
    expect(player['frameMaxDuration']).toBe(100);
    player.capDelta(-1);
    expect(player['frameMaxDuration']).toBe(100);
  });

  it('should reset frameId to 0 when stopped', () => {
    player.start();
    expect(player.frameId).toBeGreaterThan(0);
    player.stop();
    expect(player.frameId).toBe(0);
  });

  it('should bind scope with setScope', () => {
    let contextValue = null;
    const scope = { name: 'test-scope' };
    function testFn() {
      contextValue = this.name;
    }
    const p = new Player(testFn);
    p.setScope(scope);
    p.start();
    const frameId = p.frameId;
    const rafCb = rafCallbacks.get(frameId);
    rafCb(100);
    expect(contextValue).toBe('test-scope');
  });
});
