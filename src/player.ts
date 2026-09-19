import { Time } from '@1pizzateam/spock';
import { isNumber } from '@dwtechs/checkard';
import { Clock } from './clock';

export type PlayerCallback = (delta?: number) => boolean | void;

export class Player {

  private clock               : Clock;
  public frameId              : number;
  private callback            : PlayerCallback;
  private frameMinDuration    : number; // cap frame rate
  private frameMaxDuration    : number; // cap maximum frame duration (lag spikes)
  private active              : boolean;

  constructor(callback: PlayerCallback) {
    this.frameId          = 0;
    this.frameMinDuration = 0;
    this.frameMaxDuration = 0;
    this.clock            = new Clock();
    this.callback         = callback;
    this.active           = false;
    this.computeNewFrame  = this.computeNewFrame.bind(this);
  }

  public capFPS(maxFPS: number): void {
    this.frameMinDuration = isNumber(maxFPS, true, '>=', 0) ? Time.fpsToMillisec(maxFPS) : this.frameMinDuration;
  }

  public capDelta(maxDeltaSec: number): void {
    this.frameMaxDuration = isNumber(maxDeltaSec, true, '>=', 0) ? Time.secToMillisec(maxDeltaSec) : this.frameMaxDuration;
  }

  // get duration of the current frame in seconds
  public getTick(): number {
    return Time.millisecToSec(this.clock.delta);
  }

  // Get Total time elapsed in seconds
  public getTime(): number {
    return Time.millisecToSec(this.clock.total);
  }

  // Get Frame per Second 
  public getFPS(): number {
    return this.clock.computeAverageFPS();
  }

  // Get total ticks elapsed
  public getTicks(): number {
    return this.clock.ticks;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setScope(scope: object): void {
    this.callback = this.callback.bind(scope);
  }

  public start(): boolean {
    if (this.active) return false;
    this.startAnimation();
    return true;
  }

  public toggle(): boolean {
    if (this.start()) return true;
    this.pause();
    return false;
  }

  public pause(): boolean {
    if (!this.active) return false;
    this.stopAnimation();
    return true;
  }

  public stop(): void {
    this.clock.reset();
    if (this.active) this.stopAnimation();
  }

  private computeNewFrame(now: number): void {
    if (!this.active) return;
    const delta = this.clock.computeDelta(now, this.frameMaxDuration);
    if (!this.frameMinDuration || delta >= this.frameMinDuration) {
      this.clock.tick(now);
      if (this.callback(this.getTick()) === false) {
        this.stop();
        return;
      }
    } 
    this.requestNewFrame();
  }

  private startAnimation(): void {
    this.active = true;
    this.clock.start();
    this.requestNewFrame();
  }

  private stopAnimation(): void {
    this.active = false;
    this.cancelFrame();
    this.frameId = 0;
  }

  private requestNewFrame(): void {
    if (typeof window !== 'undefined' && window.requestAnimationFrame)
      this.frameId = window.requestAnimationFrame(this.computeNewFrame);
    else if (typeof requestAnimationFrame !== 'undefined')
      this.frameId = requestAnimationFrame(this.computeNewFrame);
  }

  private cancelFrame(): void {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame)
      window.cancelAnimationFrame(this.frameId);
    else if (typeof cancelAnimationFrame !== 'undefined')
      cancelAnimationFrame(this.frameId);
  }

}
