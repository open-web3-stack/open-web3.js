import { inspect } from 'util';
import { Subject, of, empty, from } from 'rxjs';
import { mergeMap, tap, bufferTime, filter } from 'rxjs/operators';
import BigNumber from 'big.js';
import BN from 'bn.js';
import { IncomingWebhook } from '@slack/webhook';
import { Raw } from '@polkadot/types';

import {
  Logger,
  LoggerPayload,
  LoggerOutput,
  LoggerLevel,
  consoleOutput,
  levelToNumber,
  toLevel
} from '@orml/util/logger';
import { defaultLogger } from '@orml/util';

const noop = () => {};

export const connectSubjectOutput = (subject: Subject<LoggerPayload>) => {
  return (payload: LoggerPayload, next: LoggerOutput = noop) => {
    subject.next(payload);
    next(payload);
  };
};

export const injectInspect = () => {
  BigNumber.prototype[inspect.custom] = function () {
    return +this.toFixed(4);
  };

  BN.prototype[inspect.custom] = function () {
    return +this.toString();
  };

  Raw.prototype[inspect.custom] = function () {
    return this.toHuman();
  };

  // eslint-disable-next-line
  Error.prototype[inspect.custom] = function (depth, options) {
    return `${this.name}: ${this.message}\n ${this.stack} ${inspect(Object.assign({}, this), {
      ...options,
      depth: 0
    })}`;
  };
};

export const configureLogger = (options: {
  logger?: Logger;
  slackWebhook?: string;
  production?: boolean;
  filter?: string;
  level?: string;
  color?: boolean;
}) => {
  injectInspect();

  const logger = options.logger || defaultLogger;

  const defaultLevel = levelToNumber(toLevel(options.level) || LoggerLevel.Log);
  const slackWebhook = options.production && options.slackWebhook;
  const slackLevel = levelToNumber(LoggerLevel.Info);
  const bufferSize = options.production ? 100 : 30;
  const panicModeLevel = levelToNumber(LoggerLevel.Warn);
  const panicModeDuration = 1000 * 60; // 1min
  const filters = options.filter?.split(',');
  const color = options.color === undefined ? !options.production : options.color;

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

        return empty();
      })
    )
    .pipe(tap((payload) => consoleOutput({ ...payload, args: payload.args.map((a) => inspect(a, false, 5, color)) }))); // log everything

  if (slackWebhook) {
    const webhook = new IncomingWebhook(slackWebhook);
    observable
      // send to slack in panic mode or above slackLevel
      .pipe(
        filter(
          (payload) => payload.timestamp.valueOf() < panicModeEndTime || levelToNumber(payload.level) >= slackLevel
        )
      )
      // avoid too many requests
      .pipe(bufferTime(2000))
      .pipe(
        tap((payloads) => {
          if (payloads.length === 0) {
            return;
          }
          const message = payloads
            .map(
              (p) =>
                `<!date^${(p.timestamp.valueOf() / 1000).toFixed(
                  0
                )}^{date_num} {time_secs}|${p.timestamp.toISOString()}> ${p.level
                  .toUpperCase()
                  .padStart(5)} [${p.namespaces.join(':')}]: ${p.args
                  .map((a) => inspect(a, false, 5, false))
                  .join(' ')}`
            )
            .join('\n');
          webhook.send(message).catch((error) => {
            console.warn('Failed to send slack message:', message, '\nError:', error);
          });
        })
      )
      .subscribe();
  } else {
    observable.subscribe();
  }

  logger.setOutput(connectSubjectOutput(subject));
};
