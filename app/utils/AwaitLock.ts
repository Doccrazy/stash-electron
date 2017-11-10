import * as assert from 'assert';

export default class AwaitLock {
  private acquired: boolean = false;
  private waitingResolvers: (() => void)[] = [];

  acquireAsync(): Promise<void> {
    if (!this.acquired) {
      this.acquired = true;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.waitingResolvers.push(resolve);
    });
  }

  release(): void {
    assert(this.acquired, 'Trying to release an unacquired lock');
    if (this.waitingResolvers.length > 0) {
      const resolve = this.waitingResolvers.shift();
      resolve!();
    } else {
      this.acquired = false;
    }
  }
}
