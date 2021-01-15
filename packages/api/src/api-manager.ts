import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { Keyring } from '@polkadot/keyring';
import { isKeyringPair } from '@polkadot/api/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { SubmittableExtrinsic, ApiOptions, AddressOrPair } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { EventRecord, Hash } from '@polkadot/types/interfaces';
import { deferred } from '@open-web3/util';

import logger from './logger';

export interface ApiManagerOptions extends ApiOptions {
  keyring?: Keyring;
  account?: string | KeyringPair;
  wsEndpoint?: string;
}

export interface SigningOptions {
  nonce: number;
  tip: number;
  account?: AddressOrPair;
}

export interface SendingOptions {
  retry: number;
}

export interface TransactionResult {
  events: EventRecord[];
  blockHash: Hash;
  txHash: Hash;
}

export default class ApiManager {
  public readonly api: ApiPromise;
  public readonly keyring: Keyring;
  public readonly defaultAccount: KeyringPair | undefined;

  private readonly accountData: Record<
    string,
    {
      nonce: Promise<number | undefined>;
    }
  > = {};

  private txId = 0;
  private txDeps: Record<number, Promise<any>> = {};

  private constructor({ keyring, account, wsEndpoint, ...options }: ApiManagerOptions) {
    const provider = wsEndpoint ? new WsProvider(wsEndpoint) : options.provider;
    this.api = new ApiPromise({ provider, ...options });
    this.keyring = keyring || new Keyring();
    if (typeof account === 'string') {
      // suri
      this.defaultAccount = this.keyring.addFromUri(account);
    } else {
      this.defaultAccount = account;
    }
  }

  public static async create(options: ApiManagerOptions): Promise<ApiManager> {
    await cryptoWaitReady();
    const manager = new ApiManager(options);
    await manager.api.isReady;

    return manager;
  }

  private getAccountData(address: string) {
    let data = this.accountData[address];
    if (!data) {
      data = { nonce: Promise.resolve(undefined) };
      this.accountData[address] = data;
    }
    return data;
  }

  public signAndSend(
    txs: SubmittableExtrinsic<'promise'> | Array<SubmittableExtrinsic<'promise'>>,
    options: Partial<SigningOptions & SendingOptions> = {}
  ) {
    const account = options.account || this.defaultAccount;
    if (!account) {
      throw new Error('Invalid argument, missing pair or defaultAccount');
    }

    let tx: SubmittableExtrinsic<'promise'>;
    if (Array.isArray(txs)) {
      if (txs.length === 1) {
        tx = txs[0];
      } else {
        tx = this.api.tx.utility.batch(txs);
      }
    } else {
      tx = txs;
    }

    const id = this.txId++;

    // retry once by default
    const retry = options.retry === undefined ? 1 : options.retry;

    const address = isKeyringPair(account) ? account.address : account.toString();

    const result = this._signAndSend(tx, id, account, options);
    let ret = result;
    if (retry > 0) {
      const finalized = deferred<TransactionResult>();
      const inBlock = deferred<TransactionResult>();
      const send = deferred<string>();

      this.txDeps[id] = send.promise;

      // ignore error
      result.inBlock.catch(() => {});
      result.finalized.catch(() => {});

      result.send
        .then((txHash) => {
          // send success

          finalized.resolve(result.finalized);
          inBlock.resolve(result.inBlock);
          send.resolve(txHash);
        })
        .catch(async (error) => {
          logger.debug('signAndSend send error', {
            error,
            from: address,
            method: `${tx.method.section}.${tx.method.method}`,
            tip: options.tip
          });

          const message = error?.message;

          if (typeof message === 'string') {
            const newOption = { ...options, retry: (options.retry || 1) - 1 };
            if (message.includes('1014: Priority is too low')) {
              // add some tip to bump priority
              newOption.tip = (options.tip || 0) + 1;
            } else if (message.includes('1010: Invalid Transaction: Stale')) {
              // wait until previous one are sent to avoid race conditions
              try {
                await this.txDeps[id - 1];
              } catch (error) {
                // previous one failed, but there isn't much we can do here
              }
              const data = this.getAccountData(address);

              // reset nonce
              data.nonce = Promise.resolve(undefined);
            }
            const result2 = this.signAndSend(tx, newOption);
            finalized.resolve(result2.finalized);
            inBlock.resolve(result2.inBlock);
            send.resolve(result2.send);
          } else {
            // not something we can handle
            finalized.reject(error);
            inBlock.reject(error);
            send.reject(error);
          }
        });

      ret = {
        finalized: finalized.promise,
        inBlock: inBlock.promise,
        send: send.promise
      };
    }

    ret.finalized.catch((error) => {
      logger.warn('signAndSend failed', {
        from: address,
        error
      });
    });
    ret.inBlock.catch(() => {}); // suppress warning of unhandled rejection

    this.txDeps[id] = ret.send;

    return ret;
  }

  private _signAndSend(
    tx: SubmittableExtrinsic<'promise'>,
    id: number,
    account: AddressOrPair,
    options: Partial<SigningOptions & SendingOptions>
  ) {
    const finalized = deferred<TransactionResult>();
    const inBlock = deferred<TransactionResult>();
    const send = deferred<any>();

    const address = isKeyringPair(account) ? account.address : account.toString();

    const data = this.getAccountData(address);

    (async () => {
      const nonce = await data.nonce;

      const nonceDeferred = deferred<number | undefined>();

      data.nonce = nonceDeferred.promise; // acquire lock

      try {
        const signed = await tx.signAsync(account, {
          tip: options.tip,
          nonce
        });
        const txHash = signed.hash.toString();

        logger.debug('signAndSend sending', {
          from: address,
          nonce: signed.nonce.toJSON(),
          method: `${signed.method.section}.${signed.method.method}`,
          args: tx.args.map((x) => x.toHuman()).join(', '),
          hash: txHash
        });

        nonceDeferred.resolve(signed.nonce.toNumber() + 1); // release lock

        const sendPromise = signed.send((res) => {
          logger.debug('signAndSend updated', {
            hash: signed.hash.toHex(),
            status: res.status.toHuman()
          });
          if (res.isInBlock) {
            inBlock.resolve({ events: res.events, blockHash: res.status.asInBlock, txHash: signed.hash });
          } else if (res.isFinalized) {
            inBlock.resolve({ events: res.events, blockHash: res.status.asFinalized, txHash: signed.hash });
            finalized.resolve({ events: res.events, blockHash: res.status.asFinalized, txHash: signed.hash });
            sendPromise.then((unsup) => unsup());
          } else if (
            res.status.isInvalid ||
            res.status.isUsurped ||
            res.status.isDropped ||
            res.status.isFinalityTimeout
          ) {
            inBlock.reject(res.status.toHuman());
            finalized.reject(res.status.toHuman());
            sendPromise.then((unsup) => unsup());
          }
        });

        send.resolve(sendPromise.then(() => signed.hash.toHex()));

        sendPromise.then(() => {
          delete this.txDeps[id];
        });
      } catch (error) {
        nonceDeferred.resolve(undefined); // release lock on error
        throw error;
      }
    })().catch((error) => {
      send.reject(error);
      inBlock.reject(error);
      finalized.reject(error);
    });

    send.promise.catch(inBlock.reject);
    send.promise.catch(finalized.reject);

    inBlock.promise.then(({ events, blockHash, txHash }) => {
      const txHashString = txHash.toString();

      logger.debug('signAndSend confirmed', {
        blockHash: blockHash.toJSON(),
        txHash: txHashString,
        events: events.map((e) => e.toHuman())
      });
    });
    return {
      finalized: finalized.promise,
      inBlock: inBlock.promise,
      send: send.promise
    };
  }
}
