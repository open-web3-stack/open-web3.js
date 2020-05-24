import moduleLogger from './logger';

const logger = moduleLogger.createLogger('Dispatcher');

export interface DispatchEvent {
  kind: symbol;
}

export interface DispatchEventSource {
  register(callback: (event: DispatchEvent) => Promise<any>): (() => void) | void;
}

export interface DispatchEventHandlerOptions {
  maxConcurrentCount: number;
  timeout: number;
}

const defaultDispatchEventHandlerOptions: DispatchEventHandlerOptions = {
  maxConcurrentCount: 100,
  timeout: 1000 * 60 * 5 // 5 mins
};

export class DispatchEventHandler<T extends DispatchEvent = DispatchEvent> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public readonly source: DispatchEventSource,
    public readonly kind: symbol,
    public readonly callback: (event: T) => Promise<any>,
    public readonly options = defaultDispatchEventHandlerOptions
  ) {}

  withOptions(options: Partial<DispatchEventHandlerOptions>) {
    Object.assign(this.options, options);
    return this;
  }
}

export class Dispatcher {
  private readonly closeHandlers: (() => void)[] = [];
  private readonly handlers: Record<any, DispatchEventHandler[]> = {};
  private readonly handlerProps: Map<DispatchEventHandler, { running: number }> = new Map();

  public constructor(handlers: DispatchEventHandler[]) {
    const set = new Set(handlers.map((h) => h.source));

    this.closeHandlers = [...set].map((source) => source.register((event) => this.handle(event)) || (() => {}));

    for (const handler of handlers) {
      const arr = this.handlers[handler.kind as any] || [];
      arr.push(handler);
      this.handlers[handler.kind as any] = arr;
    }
  }

  private async handle(event: DispatchEvent) {
    logger.debug('handle', event.kind);
    const handlers = this.handlers[event.kind as any];
    await Promise.all(handlers.map((h) => this.callHandler(h, event)));
  }

  private getHandlerProps(handler: DispatchEventHandler) {
    let props = this.handlerProps.get(handler);
    if (!props) {
      props = { running: 0 };
      this.handlerProps.set(handler, props);
    }
    return props;
  }

  private async callHandler(handler: DispatchEventHandler, event: DispatchEvent) {
    const handlerProps = this.getHandlerProps(handler);
    if (handler.options.maxConcurrentCount !== 0 && handlerProps.running >= handler.options.maxConcurrentCount) {
      logger.debug('callHandler', 'preventing start new handler due to maxConcurrentCount limit', {
        kind: handler.kind,
        ...handlerProps,
        maxConcurrentCount: handler.options.maxConcurrentCount
      });
      return;
    }
    ++handlerProps.running;
    try {
      await new Promise((resolve, reject) => {
        resolve(handler.callback(event));
        setTimeout(() => reject(new Error('Handler timeouted')), handler.options.timeout);
      });
    } catch (error) {
      logger.warn('callHandler', 'failed', { kind: handler.kind, error, handlerProps });
    }
    --handlerProps.running;
  }

  public teardown() {
    for (const handler of this.closeHandlers) {
      handler();
    }
    this.closeHandlers.length = 0;
  }
}

export class DispatcherBuilder {
  private readonly handlers: DispatchEventHandler<any>[] = [];

  public addHandler<T extends DispatchEvent>(
    handler: DispatchEventHandler<T> | DispatchEventHandler<T>[],
    ...handlers: DispatchEventHandler<T>[]
  ) {
    const toArr = ([] as DispatchEventHandler<T>[]).concat(handler);
    this.handlers.push(...toArr, ...handlers);
    return this;
  }

  public build() {
    return new Dispatcher(this.handlers);
  }
}

export const builder = () => new DispatcherBuilder();
