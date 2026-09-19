import { Player, Clock } from '../build/es6/loopr.js';

describe('loopr entrypoint', () => {
  it('should export Player and Clock', () => {
    expect(typeof Player).toBe('function');
    expect(typeof Clock).toBe('function');
  });
});


