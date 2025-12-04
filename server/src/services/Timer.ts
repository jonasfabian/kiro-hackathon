export class Timer {
  private durationSeconds: number;
  private remainingSeconds: number;
  private intervalId: NodeJS.Timeout | null;
  private onTick: (remaining: number) => void;
  private onExpire: () => void;

  constructor(
    durationSeconds: number,
    onTick: (remaining: number) => void,
    onExpire: () => void
  ) {
    this.durationSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
    this.intervalId = null;
    this.onTick = onTick;
    this.onExpire = onExpire;
  }

  start(): void {
    if (this.intervalId) {
      return; // Already running
    }

    // Call onTick immediately with initial time
    this.onTick(this.remainingSeconds);

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onExpire();
      } else {
        this.onTick(this.remainingSeconds);
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getRemainingTime(): number {
    return this.remainingSeconds;
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
