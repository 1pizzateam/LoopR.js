import { Clock } from '../build/es6/clock.js';

describe('Clock', () => {
  let clock;

  beforeEach(() => {
    clock = new Clock();
  });

  it('should initialize with default values', () => {
    expect(clock.ticks).toBe(0);
    expect(clock.total).toBe(0);
    expect(clock.delta).toBe(0);
  });

  it('should compute delta correctly', () => {
    clock.start();
    const delta = clock.computeDelta(100);
    expect(delta).toBeDefined();
    expect(clock.delta).toBe(delta);
  });

  it('should update total and ticks on tick', () => {
    clock.computeDelta(16.6);
    clock.tick(16.6);
    expect(clock.ticks).toBe(1);
    expect(clock.total).toBeCloseTo(16.6);
  });

  it('should compute average FPS', () => {
    const fps = clock.computeAverageFPS();
    expect(fps).toBe(60);
  });

  it('should wrap around circular buffer when ticks exceed array length', () => {
    let now = 0;
    for (let i = 0; i < 70; i++) {
      now += 16.6;
      clock.computeDelta(now);
      clock.tick(now);
    }
    expect(clock.ticks).toBe(70);
    expect(clock.computeAverageFPS()).toBeGreaterThan(0);
  });

  it('should reset properly', () => {
    clock.computeDelta(16.6);
    clock.tick(16.6);
    clock.reset();
    expect(clock.ticks).toBe(0);
    expect(clock.total).toBe(0);
    expect(clock.delta).toBe(0);
  });
});
