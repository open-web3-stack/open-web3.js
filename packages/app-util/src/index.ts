/* eslint-disable @typescript-eslint/no-var-requires */

import { inspect } from 'util';
import { Subject, of, EMPTY, from } from 'rxjs';
import { mergeMap, tap, bufferTime, filter } from 'rxjs/operators';

import {
  Logger,
  LoggerPayload,
  LoggerOutput,
  LoggerLevel,
  consoleOutput,
  levelToNumber,
  toLevel
} from '@open-web3/util/logger';
import { defaultLogger, HeartbeatGroup } from '@open-web3/util';

const noop = () => {};

export const connectSubjectOutput = (subject: Subject<LoggerPayload>) => {
  return (payload: LoggerPayload, next: LoggerOutput = noop) => {
    subject.next(payload);
    next(payload);
  };
};

export const injectInspect = () => {
  try {
    const BigNumber = require('big.js');
    BigNumber.prototype[inspect.custom] = function () {
      return +this.toFixed(4);
    };
  } catch (err) {
    // ignore
  }

  try {
    const BN = require('bn.js');
    BN.prototype[inspect.custom] = function () {
      return +this.toString();
    };
  } catch (err) {
    // ignore
  }

  try {
    const { Raw } = require('@polkadot/types');
    Raw.prototype[inspect.custom] = function () {
      return this.toHuman();
    };
  } catch (err) {
    // ignore
  }

  // eslint-disable-next-line no-extend-native
  Error.prototype[inspect.custom] = function (depth, options) {
    return `${this.name}: ${this.message}\n ${this.stack} ${inspect(Object.assign({}, this), {
      ...options,
      depth: Math.min(depth, 1)
    })}`;
  };
};

interface SlackWebhookOptions {
  url: string;
  level?: LoggerLevel;
  bufferTime?: number;
  bufferSize?: number;
}

export const configureLogger = (options: {
  logger?: Logger;
  slackWebhook?: string | SlackWebhookOptions;
  production?: boolean;
  filter?: string;
  level?: string;
  color?: boolean;
  heartbeatGroup?: HeartbeatGroup;
  output?: LoggerOutput;
}) => {
  injectInspect();

  const logger = options.logger || defaultLogger;

  const defaultLevel = levelToNumber(toLevel(options.level) || LoggerLevel.Log);
  const slackWebhookOptions =
    options.production &&
    (typeof options.slackWebhook === 'string' ? { url: options.slackWebhook } : options.slackWebhook);
  const slackLevel = levelToNumber(LoggerLevel.Info);
  const bufferSize = 20;
  const panicModeLevel = levelToNumber(LoggerLevel.Warn);
  const panicModeDuration = 1000 * 5; // 5s
  const filters = options.filter?.split(',');
  const color = options.color === undefined ? !options.production : options.color;
  const output =
    options.output ||
    ((payload) => consoleOutput({ ...payload, args: payload.args.map((a) => inspect(a, false, 5, color)) }));

  let panicModeEndTime = 0;

  let buffer: LoggerPayload[] = [];

  const subject = new Subject<LoggerPayload>();
  const observable = subject
    .pipe(
      mergeMap((payload) => {
        if (payload.timestamp.valueOf() < panicModeEndTime) {
          // log everything in panic mode
          return of(payload);
        }

        const level = levelToNumber(payload.level);
        if (level >= panicModeLevel) {
          // enter panic mode
          panicModeEndTime = Date.now() + panicModeDuration;

          // release buffer
          const logs = buffer;
          logs.push(payload);
          buffer = [];
          return from(logs);
        }

        if (level >= defaultLevel) {
          return of(payload);
        }

        if (filters) {
          const namespace = payload.namespaces.join(':');
          if (filters.some((f) => namespace.startsWith(f))) {
            return of(payload);
          }
        }

        buffer.push(payload);
        if (buffer.length >= bufferSize) {
          buffer.shift();
        }

        return EMPTY;
      })
    )
    .pipe(tap(output)); // log everything

  if (slackWebhookOptions) {
    try {
      const { IncomingWebhook } = require('@slack/webhook');
      const webhook = new IncomingWebhook(slackWebhookOptions.url);

      const optionBufferTime = slackWebhookOptions.bufferTime || 2000;
      const optionBufferSize = slackWebhookOptions.bufferSize || 10;

      observable
        // send to slack in panic mode or above slackLevel
        .pipe(
          filter(
            (payload) => payload.timestamp.valueOf() < panicModeEndTime || levelToNumber(payload.level) >= slackLevel
          )
        )
        // avoid too many requests
        .pipe(bufferTime(optionBufferTime, optionBufferTime, optionBufferSize))
        .pipe(
          tap((payloads) => {
            if (payloads.length === 0) {
              return;
            }
            const message = payloads
              .map((p) => {
                const emoji = {
                  [LoggerLevel.Debug]: ':sparkles:',
                  [LoggerLevel.Log]: ':eyes:',
                  [LoggerLevel.Info]: ':information_source:',
                  [LoggerLevel.Warn]: ':warning:',
                  [LoggerLevel.Error]: ':exclamation:'
                };
                const date = `<!date^${(p.timestamp.valueOf() / 1000).toFixed(
                  0
                )}^{time_secs}|${p.timestamp.toISOString()}>`;
                const level = p.level.toUpperCase().padStart(7);
                const mention = p.level === LoggerLevel.Warn || p.level === LoggerLevel.Error ? '<!channel>' : '';
                return `_${date}_ ${emoji[p.level]}${level} [\`${p.namespaces.join(':')}\`]: ${p.args
                  .map((a) =>
                    inspect(a, { showHidden: false, depth: 5, colors: false, compact: true, breakLength: Infinity })
                  )
                  .join(' ')} ${mention}`;
              })
              .join('\n');
            webhook.send(message).catch((error) => {
              console.warn('Failed to send slack message:', message, '\nError:', error);
            });
          })
        )
        .subscribe();
    } catch (err) {
      console.warn("Slack webhook is configured but require('@slack/webhook') failed", err);
      observable.subscribe();
    }
  } else {
    observable.subscribe();
  }

  logger.setOutput(connectSubjectOutput(subject));

  const heartbeatGroup = options.heartbeatGroup;
  if (heartbeatGroup) {
    logger.addMiddleware((payload, next) => {
      const level = levelToNumber(payload.level);
      if (level >= panicModeLevel) {
        heartbeatGroup.markDead(payload.namespaces.join(':'));
      }
      next(payload);
    });
  }
};
