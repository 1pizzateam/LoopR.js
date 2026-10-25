import { RollingAverage, Utils } from '@1pizzateam/spock';

export const SCALES: readonly number[] = [1, 0.85, 0.7, 0.55];

export interface QualityOptions {
  scales?: readonly number[];
  windowSize?: number;
  slowThreshold?: number;
  fastThreshold?: number;
  riseAfter?: number;
  failedWithin?: number;
  ignoreAbove?: number;
}

const DEFAULT_WINDOW = 45;
const DEFAULT_SLOW = 0.0225;
const DEFAULT_FAST = 0.0175;
const DEFAULT_RISE_AFTER = 8;
const DEFAULT_FAILED_WITHIN = 10;
const DEFAULT_IGNORE_ABOVE = 0.09;

/**
 * Adaptive resolution / quality scaler built on RollingAverage.
 * Drops scale quickly on sustained slow frames, ignores isolated stalls,
 * rises slowly after sustained fast frames, and bans levels that immediately fail after rising.
 */
export class Quality {

  public scales: readonly number[];
  public level: number;
  public ceiling: number;
  public window: RollingAverage;
  public fastTime: number;
  public clock: number;
  public lastRise: number;

  private windowSize: number;
  private slowThreshold: number;
  private fastThreshold: number;
  private riseAfter: number;
  private failedWithin: number;
  private ignoreAbove: number;

  constructor(options: QualityOptions = {}) {
    this.scales = options.scales ?? SCALES;
    this.windowSize = options.windowSize ?? DEFAULT_WINDOW;
    this.slowThreshold = options.slowThreshold ?? DEFAULT_SLOW;
    this.fastThreshold = options.fastThreshold ?? DEFAULT_FAST;
    this.riseAfter = options.riseAfter ?? DEFAULT_RISE_AFTER;
    this.failedWithin = options.failedWithin ?? DEFAULT_FAILED_WITHIN;
    this.ignoreAbove = options.ignoreAbove ?? DEFAULT_IGNORE_ABOVE;

    this.level = 0;
    this.ceiling = 0;
    this.window = new RollingAverage(this.windowSize);
    this.fastTime = 0;
    this.clock = 0;
    this.lastRise = -Infinity;
  }

  public get scale(): number {
    return this.scales[this.level];
  }

  public reset(): void {
    this.level = 0;
    this.ceiling = 0;
    this.window.reset();
    this.fastTime = 0;
    this.clock = 0;
    this.lastRise = -Infinity;
  }

  /** Feed one frame delta time in seconds. Returns the new scale when it changed, otherwise null. */
  public update(dt: number): number | null {
    if (dt <= 0 || dt > this.ignoreAbove)
      return null;
    this.clock += dt;
    this.window.push(dt);
    if (this.window.count < this.windowSize)
      return null;

    const average = this.window.average;
    this.window.reset();

    if (average > this.slowThreshold && this.level < this.scales.length - 1) {
      if (this.clock - this.lastRise < this.failedWithin)
        this.ceiling = Utils.clamp(this.level + 1, this.ceiling, this.scales.length - 1);
      this.level++;
      this.fastTime = 0;
      return this.scale;
    }

    this.fastTime = average < this.fastThreshold ? this.fastTime + average * this.windowSize : 0;
    if (this.fastTime >= this.riseAfter && this.level > this.ceiling) {
      this.level--;
      this.fastTime = 0;
      this.lastRise = this.clock;
      return this.scale;
    }
    return null;
  }

}
