import { Time, NumArray } from '@1pizzateam/spock';

export class Clock {

  public ticks            : number = 0;
  public total            : number = 0;
  public delta            : number = 0;
  private now             : number = 0;
  private fpsArrayLength  : number = 60;
  private fpsArray        : Array<number> = Array(this.fpsArrayLength);

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.now   = 0;
    this.total = 0;
    this.delta = 0;
    this.ticks = 0;
    this.fpsArray.fill(60);
  }

  public start(): void {
    this.now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  public tick(now: number): void {
    this.now = now;
    this.total += this.delta;
    this.fpsArray[this.ticks % this.fpsArrayLength] = Time.millisecToFps(this.delta);
    this.ticks++;
  }

  public computeDelta(now: number): number {
    this.delta = now - this.now;
    return this.delta;
  }

  public computeAverageFPS(): number {
    return NumArray.average(this.fpsArray);
  }

}
