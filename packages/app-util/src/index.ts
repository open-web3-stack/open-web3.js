import { Subject } from 'rxjs';
import { LoggerPayload, LoggerOutput } from '@orml/util/logger';

const noop = () => {};

export const connectSubjectOutput = (subject: Subject<LoggerPayload>) => {
  return (payload: LoggerPayload, next: LoggerOutput = noop) => {
    subject.next(payload);
    next(payload);
  };
};
