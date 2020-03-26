import { Logger, LoggerPayload, createFilterOutput, LoggerLevel, createBufferedOutput, toLevel } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let logs: LoggerPayload[];

  beforeEach(() => {
    logs = [];
    logger = new Logger();
    logger.addMiddleware((payload) => logs.push(payload));
  });

  it('logs with different levels', () => {
    logger.debug('debug');
    logger.log('log');
    logger.warn('warn');
    logger.error('error');

    expect(logs).toEqual([
      {
        level: 'debug',
        args: ['debug'],
        timestamp: expect.any(Date),
        namespaces: []
      },
      {
        level: 'log',
        args: ['log'],
        timestamp: expect.any(Date),
        namespaces: []
      },
      {
        level: 'warn',
        args: ['warn'],
        timestamp: expect.any(Date),
        namespaces: []
      },
      {
        level: 'error',
        args: ['error'],
        timestamp: expect.any(Date),
        namespaces: []
      }
    ]);
  });

  describe('filterOutput', () => {
    beforeEach(() => {
      logger.addMiddleware(createFilterOutput(LoggerLevel.Warn));
    });

    it('filter logs', () => {
      logger.debug('debug');
      logger.log('log');
      logger.warn('warn');
      logger.error('error');

      expect(logs).toEqual([
        {
          level: 'warn',
          args: ['warn'],
          timestamp: expect.any(Date),
          namespaces: []
        },
        {
          level: 'error',
          args: ['error'],
          timestamp: expect.any(Date),
          namespaces: []
        }
      ]);
    });
  });

  describe('bufferedOutput', () => {
    beforeEach(() => {
      logger.addMiddleware(createBufferedOutput(LoggerLevel.Warn, 3));
    });

    it('buffer logs', () => {
      logger.debug(1);
      logger.debug(2);
      logger.debug(3);
      logger.debug(4);

      expect(logs).toEqual([]);

      logger.warn(5);

      expect(logs).toEqual([
        {
          level: 'debug',
          args: [2],
          timestamp: expect.any(Date),
          namespaces: []
        },
        {
          level: 'debug',
          args: [3],
          timestamp: expect.any(Date),
          namespaces: []
        },
        {
          level: 'debug',
          args: [4],
          timestamp: expect.any(Date),
          namespaces: []
        },
        {
          level: 'warn',
          args: [5],
          timestamp: expect.any(Date),
          namespaces: []
        }
      ]);
    });
  });

  describe('with child logger', () => {
    let childLogger: Logger;
    let childLogger2: Logger;
    let nestedChildLogger: Logger;

    beforeEach(() => {
      childLogger = logger.createLogger('child');
      childLogger2 = logger.createLogger('child2');
      nestedChildLogger = childLogger.createLogger('nested');
    });

    it('logs with namespaces', () => {
      childLogger.info(1, 2);
      childLogger2.info([3, 4]);
      nestedChildLogger.log({ '5': 6 });

      expect(logs).toEqual([
        {
          level: 'info',
          args: [1, 2],
          timestamp: expect.any(Date),
          namespaces: ['child']
        },
        {
          level: 'info',
          args: [[3, 4]],
          timestamp: expect.any(Date),
          namespaces: ['child2']
        },
        {
          level: 'log',
          args: [{ '5': 6 }],
          timestamp: expect.any(Date),
          namespaces: ['child', 'nested']
        }
      ]);
    });

    it('can apply middleware on child logger', () => {
      childLogger.addMiddleware((payload, next) => next({ ...payload, args: payload.args.concat('child') }));
      childLogger2.addMiddleware((payload, next) => next({ ...payload, args: payload.args.concat('child2') }));
      nestedChildLogger.addMiddleware((payload, next) => next({ ...payload, args: payload.args.concat('nested') }));

      childLogger.info(1, 2);
      childLogger2.info([3, 4]);
      nestedChildLogger.log({ '5': 6 });

      expect(logs).toEqual([
        {
          level: 'info',
          args: [1, 2, 'child'],
          timestamp: expect.any(Date),
          namespaces: ['child']
        },
        {
          level: 'info',
          args: [[3, 4], 'child2'],
          timestamp: expect.any(Date),
          namespaces: ['child2']
        },
        {
          level: 'log',
          args: [{ '5': 6 }, 'nested', 'child'],
          timestamp: expect.any(Date),
          namespaces: ['child', 'nested']
        }
      ]);
    });

    it('modify parent middleware are applied on children', () => {
      logger.addMiddleware((payload, next) => next({ ...payload, args: payload.args.concat('logger') }));

      logger.debug('0');
      childLogger.info(1, 2);
      childLogger2.info([3, 4]);
      nestedChildLogger.log({ '5': 6 });

      expect(logs).toEqual([
        {
          level: 'debug',
          args: ['0', 'logger'],
          timestamp: expect.any(Date),
          namespaces: []
        },
        {
          level: 'info',
          args: [1, 2, 'logger'],
          timestamp: expect.any(Date),
          namespaces: ['child']
        },
        {
          level: 'info',
          args: [[3, 4], 'logger'],
          timestamp: expect.any(Date),
          namespaces: ['child2']
        },
        {
          level: 'log',
          args: [{ '5': 6 }, 'logger'],
          timestamp: expect.any(Date),
          namespaces: ['child', 'nested']
        }
      ]);
    });
  });

  describe('toLevel', () => {
    it('convert number to levels', () => {
      expect(toLevel('0')).toEqual(LoggerLevel.Debug);
      expect(toLevel('1')).toEqual(LoggerLevel.Log);
      expect(toLevel('2')).toEqual(LoggerLevel.Info);
      expect(toLevel('3')).toEqual(LoggerLevel.Warn);
      expect(toLevel('4')).toEqual(LoggerLevel.Error);
      expect(toLevel('5')).toBeUndefined();
    });

    it('convert string to levels', () => {
      expect(toLevel('debug')).toEqual(LoggerLevel.Debug);
      expect(toLevel('Log')).toEqual(LoggerLevel.Log);
      expect(toLevel('INFO')).toEqual(LoggerLevel.Info);
      expect(toLevel('warN')).toEqual(LoggerLevel.Warn);
      expect(toLevel('eRROR')).toEqual(LoggerLevel.Error);
      expect(toLevel('other')).toBeUndefined();
    });
  });
});
