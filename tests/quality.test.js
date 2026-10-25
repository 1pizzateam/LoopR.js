import { Quality, SCALES } from '../build/es6/quality.js';

describe('Quality', () => {
  const feed = (q, dt, seconds) => {
    const frames = Math.round(seconds / dt / 45) * 45;
    for (let i = 0; i < frames; i++)
      q.update(dt);
  };

  it('drops on slow frames, ignores stalls, and rises only after a long fast spell', () => {
    const q = new Quality();
    expect(q.scales).toEqual(SCALES);

    feed(q, 1 / 60, 20);
    expect(q.scale).toBe(1);

    for (let i = 0; i < 500; i++)
      q.update(0.5);
    expect(q.scale).toBe(1);
    expect(q.update(-0.1)).toBeNull();

    feed(q, 1 / 30, 1.5);
    expect(q.scale).toBeLessThan(1);
    const dropped = q.scale;

    feed(q, 1 / 60, 4);
    expect(q.scale).toBe(dropped);
    feed(q, 1 / 60, 12);
    expect(q.scale).toBeGreaterThan(dropped);
  });

  it('stops retrying a level that failed right after a rise and supports reset/options', () => {
    const q = new Quality({ scales: [1, 0.75, 0.5] });
    feed(q, 1 / 30, 1.5);
    const low = q.scale;
    feed(q, 1 / 60, 12);
    expect(q.scale).toBeGreaterThan(low);
    feed(q, 1 / 30, 1.5);
    expect(q.scale).toBe(low);
    feed(q, 1 / 60, 60);
    expect(q.scale).toBe(low);

    q.reset();
    expect(q.scale).toBe(1);
    expect(q.ceiling).toBe(0);
  });
});
