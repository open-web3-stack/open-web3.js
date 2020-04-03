export class Heartbeat {
  private _lastAlive = 0;
  private _resetableLastDead = 0;
  private _lastDead = 0;

  public constructor(private readonly _livePeriod: number, private readonly _deadPeriod) {}

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
      isAlive: this.isAlive(),
      lastAlive: this.lastDead,
      lastDead: this.lastDead
    };
  }
}

export class HeartbeatGroup {
  public constructor(
    public readonly options: { livePeriod: number; deadPeriod: number },
    public readonly heartbeats: Record<string, Heartbeat> = {}
  ) {}

  public isAlive() {
    return Object.values(this.heartbeats).every((h) => h.isAlive());
  }

  public getHeartbeat(name: string) {
    let heartbeat = this.heartbeats[name];
    if (!heartbeat) {
      heartbeat = new Heartbeat(this.options.livePeriod, this.options.deadPeriod);
      this.heartbeats[name] = heartbeat;
    }
    return heartbeat;
  }

  public markAlive(name: string, resetError = false) {
    this.getHeartbeat(name).markAlive(resetError);
  }

  public markDead(name: string) {
    this.getHeartbeat(name).markDead();
  }

  public summary() {
    return {
      isAlive: this.isAlive(),
      details: Object.entries(this.heartbeats).map(([name, h]) => ({ name, ...h.summary() }))
    };
  }
}
