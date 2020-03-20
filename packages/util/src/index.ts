import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { EventRecord, Hash } from '@polkadot/types/interfaces';
import { SignatureOptions } from '@polkadot/types/types';

import defaultLogger from '@orml/util/logger';

export const logger = defaultLogger.createLogger('@orml/util');

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

const sendTransactionLogger = logger.createLogger('sendTransaction');

export const sendTransaction = (
  tx: SubmittableExtrinsic<'promise'>,
  pair: KeyringPair,
  options?: Partial<SignatureOptions>
) => {
  const finalized = deferred<{ events: EventRecord[]; blockHash: Hash; txHash: Hash }>();
  const inBlock = deferred<{ events: EventRecord[]; blockHash: Hash; txHash: Hash }>();
  const send = deferred();

  tx.signAsync(pair, options || {}).then(signed => {
    sendTransactionLogger.debug('sending', {
      from: pair.address.toString(),
      nonce: signed.nonce.toJSON(),
      method: `${signed.method.sectionName}.${signed.method.methodName}`,
      args: tx.args.map(x => x.toHuman()).join(', '),
      hash: signed.hash.toString()
    });
    const sendPromise = signed.send(res => {
      sendTransactionLogger.debug('updated', {
        hash: signed.hash.toHex(),
        status: res.status.toHuman()
      });
      if (res.isInBlock) {
        inBlock.resolve({ events: res.events, blockHash: res.status.asInBlock, txHash: signed.hash });
      } else if (res.isFinalized) {
        inBlock.resolve({ events: res.events, blockHash: res.status.asFinalized, txHash: signed.hash });
        finalized.resolve({ events: res.events, blockHash: res.status.asFinalized, txHash: signed.hash });
        sendPromise.then(unsup => unsup());
      } else if (res.status.isInvalid || res.status.isUsurped || res.status.isDropped || res.status.isFinalityTimeout) {
        inBlock.reject(res.status.toHuman());
        finalized.reject(res.status.toHuman());
        sendPromise.then(unsup => unsup());
      }
    });
    sendPromise.then(send.resolve);
    sendPromise.catch(send.reject);
  });

  send.promise.catch(inBlock.reject);
  send.promise.catch(finalized.reject);

  inBlock.promise.then(({ events, blockHash, txHash }) => {
    sendTransactionLogger.debug('confirmed', {
      blockHash: blockHash.toJSON(),
      txHash: txHash.toJSON(),
      events: events.map(e => e.toHuman())
    });
  });
  return {
    finalized: finalized.promise,
    inBlock: inBlock.promise,
    send: send.promise
  };
};
