import BigNumber from 'big.js';

import defaultLogger from '@orml/util/logger';

export { defaultLogger };

export const moduleLogger = defaultLogger.createLogger('@orml/util');

export function deferred<T>() {
  const deferred: {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  } = {} as any;
  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

export const ACCURACY = new BigNumber('1e+18');
export const withAccuracy = (rawPrice: string | number) => new BigNumber(rawPrice).mul(ACCURACY).toFixed();
