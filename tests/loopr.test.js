import { Player, Clock, Quality, SCALES, Time, Accumulator, RollingAverage } from '../build/es6/loopr.js';

describe('loopr entrypoint', () => {
  it('should export Player, Clock, Quality, SCALES, and Spock timing primitives', () => {
    expect(typeof Player).toBe('function');
    expect(typeof Clock).toBe('function');
    expect(typeof Quality).toBe('function');
    expect(Array.isArray(SCALES)).toBe(true);
    expect(typeof Time).toBe('object');
    expect(typeof Accumulator).toBe('function');
    expect(typeof RollingAverage).toBe('function');
  });
});

