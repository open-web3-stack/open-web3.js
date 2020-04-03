export class Heartbeat {
  private _lastAlive = 0;
  private _resetableLastDead = 0;
  private _lastDead = 0;

  public constructor(public readonly name, private readonly _livePeriod: number, private readonly _deadPeriod) {}

  public markAlive(resetError = false) {
    this._lastAlive = Date.now();
    if (resetError) {
      this._resetableLastDead = 0;
    }
  }

  public markDead() {
    this._resetableLastDead = Date.now();
    this._lastDead = this._resetableLastDead;
  }

  public isAlive() {
    const now = Date.now();
    if (now - this._resetableLastDead <= this._deadPeriod) {
      return false;
    }
    return now - this._lastAlive <= this._livePeriod;
  }

  public get lastAlive() {
    return this._lastAlive;
  }

  public get lastDead() {
    return this._lastDead;
  }

  public summary() {
    return {
      name: this.name,
      isAlive: this.isAlive(),
      lastAlive: this.lastDead,
      lastDead: this.lastDead
    };
  }
}

export class HeartbeatGroup {
  public constructor(public readonly heartbeats: Heartbeat[]) {}

  public isAlive() {
    return this.heartbeats.every((h) => h.isAlive());
  }

  public summary() {
    return {
      isAlive: this.isAlive(),
      details: this.heartbeats.map((h) => h.summary())
    };
  }
}
