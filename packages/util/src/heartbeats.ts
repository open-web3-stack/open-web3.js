export type CheckHeartbeat = () => Promise<{ isAlive: boolean }>;

export class Heartbeat {
  private _lastAlive = 0;
  private _resetableLastDead = 0;
  private _lastDead = 0;

  public constructor(private readonly _livePeriod: number = Infinity, private readonly _deadPeriod: number = 0) {}

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
      lastAlive: this.lastAlive,
      lastDead: this.lastDead
    };
  }
}

export class HeartbeatGroup {
  public readonly options: { livePeriod: number; deadPeriod: number };
  public readonly checks: Record<string, CheckHeartbeat>;
  public readonly heartbeats: Record<string, Heartbeat>;

  public constructor(
    { livePeriod = Infinity, deadPeriod = 0 }: { livePeriod?: number; deadPeriod?: number } = {},
    checks: Record<string, CheckHeartbeat> = {},
    heartbeats: Record<string, Heartbeat> = {}
  ) {
    this.options = { livePeriod, deadPeriod };
    this.checks = checks;
    this.heartbeats = heartbeats;
  }

  public async isAlive() {
    const alive = Object.values(this.heartbeats).every((h) => h.isAlive());
    if (!alive) {
      return false;
    }
    const checks = Object.values(this.checks);
    if (checks.length === 0) {
      return true;
    }
    return new Promise<boolean>((resolve) => {
      let count = checks.length;
      for (const check of checks) {
        check()
          .then(({ isAlive }) => {
            if (isAlive) {
              --count;
              if (count === 0) {
                resolve(true);
              }
            } else {
              resolve(false);
            }
          })
          .catch(() => resolve(false));
      }
    });
  }

  public addHeartbeat(name: string, heartbeat: Heartbeat | CheckHeartbeat) {
    if (heartbeat instanceof Heartbeat) {
      this.heartbeats[name] = heartbeat;
    } else {
      this.checks[name] = heartbeat;
    }
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

  public async summary() {
    const details = Object.entries(this.heartbeats).map(([name, h]) => ({ name, ...h.summary() }));
    for (const [name, check] of Object.entries(this.checks)) {
      let result;
      try {
        result = await check();
      } catch (error) {
        result = {
          isAlive: false,
          error
        };
      }
      details.push({
        name,
        ...result
      });
    }
    return {
      isAlive: details.every((d) => d.isAlive),
      details
    };
  }
}
