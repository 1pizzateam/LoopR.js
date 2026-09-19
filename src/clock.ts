import { Time, RollingAverage } from '@1pizzateam/spock';

export class Clock {

  public ticks       : number = 0;
  public total       : number = 0;
  public delta       : number = 0;
  private now        : number = 0;
  private rollingFps : RollingAverage = new RollingAverage(60);

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.now   = 0;
    this.total = 0;
    this.delta = 0;
    this.ticks = 0;
    this.rollingFps.reset();
  }

  public start(): void {
    this.now = Time.now();
  }

  public tick(now: number): void {
    this.now = now;
    this.total += this.delta;
    this.rollingFps.push(Time.millisecToFps(this.delta));
    this.ticks++;
  }

  public computeDelta(now: number, maxDelta: number = 0): number {
    this.delta = now - this.now;
    if (maxDelta > 0) this.delta = Time.clampDelta(this.delta, maxDelta);
    return this.delta;
  }

  public computeAverageFPS(): number {
    return this.rollingFps.average;
  }

}
