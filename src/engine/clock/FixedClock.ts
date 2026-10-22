/** GBA logic advances at 59.7275 Hz. Rendering may interpolate independently. */
export class FixedClock {
  static readonly stepMs = 1000 / 59.7275;
  private accumulator = 0;
  private previous = 0;
  start(now: number) { this.previous = now; }
  consume(now: number, update: () => void) {
    this.accumulator += Math.min(now - this.previous, 250);
    this.previous = now;
    while (this.accumulator >= FixedClock.stepMs) {
      update(); this.accumulator -= FixedClock.stepMs;
    }
  }
}
