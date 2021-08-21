import { DispatchEvent, DispatchEventSource, DispatchEventHandler } from './dispatcher';

export class SetIntervalEventSource implements DispatchEventSource {
  public readonly interval: number;
  public readonly immediately: boolean;
  public constructor(options: number | { interval: number; immediately?: boolean }) {
    if (typeof options === 'number') {
      this.interval = options;
      this.immediately = false;
    } else {
      this.interval = options.interval;
      this.immediately = Boolean(options.immediately);
    }
  }

  public readonly kind = Symbol('SetIntervalEvent');

  public register(callback: (event: DispatchEvent) => void) {
    const event = { kind: this.kind };
    const id = setInterval(() => callback(event), this.interval);
    if (this.immediately) {
      setImmediate(() => callback(event));
    }
    return () => clearInterval(id);
  }

  public handler(...callbacks: (() => any)[]): DispatchEventHandler {
    return new DispatchEventHandler(this, this.kind, () => Promise.all(callbacks.map((c) => c())));
  }
}
export interface SingleEvent<E> extends DispatchEvent {
  payload: E;
}

export class SingleEventSource<E> implements DispatchEventSource {
  private readonly callbacks: ((event: SingleEvent<E>) => void)[] = [];

  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly kind: symbol = Symbol('Event')) {}

  public register(callback: (event: SingleEvent<E>) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public handler(...callbacks: ((payload: E) => any)[]): DispatchEventHandler<SingleEvent<E>> {
    return new DispatchEventHandler(this, this.kind, (e: SingleEvent<E>) =>
      Promise.all(callbacks.map((c) => c(e.payload)))
    );
  }

  public emit(event: E) {
    return Promise.all(this.callbacks.map((c) => c({ kind: this.kind, payload: event })));
  }
}

export interface MultiEvent<E> extends DispatchEvent {
  payload: E[keyof E];
}

export class MultiEventSource<E> implements DispatchEventSource {
  private readonly callbacks: ((event: MultiEvent<E>) => void)[] = [];
  private readonly kinds: { [K in keyof E]: symbol } = {} as any;

  public register(callback: (event: MultiEvent<E>) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public handler<T extends { [K in keyof E]: (event: E[K]) => any }>(
    callbacks: T
  ): DispatchEventHandler<MultiEvent<E>>[] {
    const ret: DispatchEventHandler<MultiEvent<E>>[] = [];
    for (const [key, callback] of Object.entries(callbacks)) {
      const kind = Symbol(key);
      this.kinds[key as keyof E] = kind;
      ret.push(new DispatchEventHandler(this, kind, (e: MultiEvent<E>) => (callback as any)(e.payload)));
    }
    return ret;
  }

  public emit<T extends keyof E>(kind: T, event: E[T]) {
    return Promise.all(this.callbacks.map((c) => c({ kind: this.kinds[kind], payload: event })));
  }
}

export function onInterval(option: number | { interval: number; immediately?: boolean }, ...handlers: (() => any)[]) {
  return new SetIntervalEventSource(option).handler(...handlers);
}

export function createEvent<E>(name?: string) {
  return new SingleEventSource<E>(name === undefined ? undefined : Symbol(name));
}

export function onEvent<E>(source: SingleEventSource<E>, ...callbacks: ((payload: E) => any)[]) {
  return source.handler(...callbacks);
}

export function createEvents<E>() {
  return new MultiEventSource<E>();
}

export function onEvents<E, T extends { [K in keyof E]: (event: E[K]) => any }>(
  source: MultiEventSource<E>,
  handlers: T
) {
  return source.handler(handlers);
}
