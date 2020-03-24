import { isHex, isNumber, u8aToU8a, u8aToHex } from '@polkadot/util';
import { TypeRegistry, StorageKey, Vec, GenericExtrinsic } from '@polkadot/types';
import { ValidatorId, Header as _Header } from '@polkadot/types/interfaces';
import { HeaderExtended } from '@polkadot/api-derive/type';
import Metadata from '@polkadot/metadata/Decorated';
import { createTypeUnsafe } from '@polkadot/types/create';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { Observable, range, from, concat, of, throwError, timer } from 'rxjs';
import { switchMap, map, take, shareReplay, mergeMap, pairwise, catchError, timeout, retryWhen } from 'rxjs/operators';

import {
  BlockAt,
  ScannerOptions,
  RpcProvider,
  Bytes,
  BlockAtOptions,
  Block,
  Header,
  BlockRaw,
  Confirmation,
  RuntimeVersion,
  SubcribeOptions,
  ChainInfo,
  TypeProvider,
  Extrinsic,
  SubscribeBlock,
  SubscribeBlockError,
  Event,
  WsProvider,
  Meta
} from './types';

class Scanner {
  private rpcProvider: RpcProvider;
  private typeProvider?: TypeProvider;
  private metadataRequest: Record<string, Promise<ChainInfo>>;

  public wsProvider: WsProvider;
  public chainInfo: Record<string, ChainInfo>;

  constructor(options: ScannerOptions) {
    this.wsProvider = options.wsProvider;
    this.rpcProvider = options.rpcProvider || options.wsProvider;
    this.typeProvider = options.types;
    this.chainInfo = {};
    this.metadataRequest = {};
  }

  private createMethodSubscribe<T>(methods: string[], ...params: any[]): Observable<T> {
    const [updateType, subMethod, unsubMethod] = methods;

    return new Observable<T>(observer => {
      let subscriptionPromise: Promise<number | void> = Promise.resolve();
      const errorHandler = (error: Error): void => {
        observer.error(error);
      };

      try {
        const update = (error: Error | null, result?: any): void => {
          if (error) {
            // errorHandler(error)
            return;
          }
          observer.next(result);
        };

        subscriptionPromise = this.wsProvider
          .subscribe(updateType, subMethod, params, update)
          .catch(error => errorHandler(error));
      } catch (error) {
        errorHandler(error);
      }

      return (): void => {
        subscriptionPromise.then(
          (subscriptionId): Promise<boolean> =>
            isNumber(subscriptionId)
              ? this.wsProvider.unsubscribe(updateType, unsubMethod, subscriptionId)
              : Promise.resolve(false)
        );
      };
    });
  }

  public async getBlockDetail(_blockAt?: BlockAtOptions): Promise<Block> {
    const blockAt = await this.getBlockAt(_blockAt);
    const chainInfo = await this.getChainInfo(blockAt);
    const requestes: any[] = [];

    requestes.push(
      this.getEvents(blockAt, chainInfo).then(eventRecords => {
        return eventRecords.map((event, index) => {
          return {
            index,
            bytes: event.toHex(),
            section: event.event.section,
            method: event.event.method,
            phaseType: event.phase.type,
            phaseIndex: event.phase.index,
            args: event.event.data.toJSON() as any[]
          } as Event;
        });
      })
    );

    const blockRaw: BlockRaw = await this.rpcProvider.send('chain_getBlock', [blockAt.blockHash]);

    requestes.push(
      this.getHeader(blockRaw.block.header, blockAt, chainInfo).then(header => {
        return header.author?.toString();
      })
    );

    const extrinsics = blockRaw.block.extrinsics.map((extrinsic, index) => {
      return {
        index,
        ...this.decodeTx(extrinsic, blockAt, chainInfo)
      };
    });

    const [events, author] = await Promise.all(requestes as [Promise<Event[]>, Promise<string>]);

    const timestamp = extrinsics?.[0]?.args?.now;

    return {
      raw: blockRaw,
      number: Number(blockRaw.block.header.number),
      hash: blockAt.blockHash,
      timestamp,
      author,
      events,
      extrinsics,
      chainInfo
    };
  }

  public async getHeader(header: Header, _blockAt: BlockAtOptions, meta: Meta): Promise<HeaderExtended> {
    const validators = await this.getSessionValidators(_blockAt);
    return new HeaderExtended(
      meta.registry,
      createTypeUnsafe<_Header>(meta.registry, 'Header', [header]),
      validators
    );
  }

  public async getRuntimeVersion(blockHash?: Bytes): Promise<RuntimeVersion> {
    return this.rpcProvider.send('state_getRuntimeVersion', [blockHash]);
  }

  public async getBlockHash(at: number | Bytes): Promise<Bytes> {
    if (typeof at === 'number' && !isNaN(at as any) && !isHex(at)) {
      const blockHash = this.rpcProvider.send('chain_getBlockHash', [at]);
      return blockHash;
    } else {
      return at as Bytes;
    }
  }

  public async getBlockAt(blockAt?: { blockHash?: Bytes; blockNumber?: number }): Promise<BlockAt> {
    if (blockAt?.blockHash && blockAt?.blockNumber !== undefined) {
      return {
        blockHash: blockAt.blockHash,
        blockNumber: blockAt.blockNumber
      };
    }
    if (!blockAt) {
      const header = await this.rpcProvider.send('chain_getHeader', []);
      const blockNumber = Number(header.number);
      const blockHash = await this.rpcProvider.send('chain_getBlockHash', []);
      return {
        blockNumber: blockNumber,
        blockHash: blockHash
      };
    } else if (blockAt.blockNumber !== undefined) {
      const blockHash = await this.rpcProvider.send('chain_getBlockHash', [blockAt.blockNumber]);
      return {
        blockNumber: blockAt.blockNumber,
        blockHash: blockHash
      };
    } else if (blockAt.blockHash) {
      const header = await this.rpcProvider.send('chain_getHeader', [blockAt.blockHash]);
      return {
        blockNumber: Number(header.number),
        blockHash: blockAt.blockHash
      };
    } else {
      throw new Error('expect blockHash or blockNumber');
    }
  }

  public async getChainInfo(_blockAt?: BlockAtOptions): Promise<ChainInfo> {
    const { blockHash, blockNumber } = await this.getBlockAt(_blockAt);
    const runtimeVersion = await this.getRuntimeVersion(blockHash);
    const cacheKey = `${runtimeVersion.specName}/${runtimeVersion.specVersion}`;
    if (!this.chainInfo[cacheKey]) {
      const registry = new TypeRegistry();
      const typeProvider = this.typeProvider;
      if (typeProvider) {
        if (typeof typeProvider === 'function') {
          registry.register(typeProvider(runtimeVersion.specVersion));
        } else {
          registry.register(typeProvider);
        }
      }

      // eslint-disable-next-line
      if (!this.metadataRequest[cacheKey]) {
        this.metadataRequest[cacheKey] = this.rpcProvider
          .send('state_getMetadata', [blockHash])
          .then((rpcdata: string) => {
            return {
              id: cacheKey,
              min: blockNumber,
              max: blockNumber,
              bytes: rpcdata,
              metadata: new Metadata(registry, rpcdata),
              registry: registry,
              runtimeVersion: runtimeVersion
            };
          });
      }

      this.chainInfo[cacheKey] = await this.metadataRequest[cacheKey];
    } else {
      this.chainInfo[cacheKey].min = Math.min(this.chainInfo[cacheKey].min, blockNumber);
      this.chainInfo[cacheKey].max = Math.max(this.chainInfo[cacheKey].max, blockNumber);
    }
    return this.chainInfo[cacheKey];
  }

  public async getSessionValidators(_blockAt: BlockAtOptions): Promise<Vec<ValidatorId>> {
    const { metadata, registry } = await this.getChainInfo(_blockAt);
    const storageKey = new StorageKey(registry, metadata.query.session.validators);
    return this.getStorageValue<Vec<ValidatorId>>(storageKey, _blockAt);
  }

  public async getEvents(_blockAt: BlockAtOptions, meta: Meta): Promise<Vec<EventRecord>> {
    const storageKey = new StorageKey(meta.registry, meta.metadata.query.system.events);
    return this.getStorageValue<Vec<EventRecord>>(storageKey, _blockAt);
  }

  public async getStorageValue<T>(storageKey: StorageKey, _blockAt: BlockAtOptions): Promise<T> {
    const blockAt = await this.getBlockAt(_blockAt);
    const { registry } = await this.getChainInfo(_blockAt);
    const raw: Bytes = await this.rpcProvider.send('state_getStorage', [storageKey.toHex(), blockAt.blockHash]);

    // eslint-disable-next-line
    return createTypeUnsafe(registry, storageKey.outputType as string, [u8aToU8a(raw)], true) as any;
  }

  public decodeTx(txData: Bytes, _blockAt: BlockAtOptions, meta: Meta): Extrinsic {
    const extrinsic = new GenericExtrinsic(meta.registry, txData);
    const { callIndex, args } = extrinsic.method.toJSON() as any;

    return {
      bytes: txData,
      hash: u8aToHex(extrinsic.hash),
      tip: extrinsic.tip.toString(),
      nonce: extrinsic.nonce.toNumber(),
      method: extrinsic.method.methodName,
      section: extrinsic.method.sectionName,
      signer: extrinsic.isSigned ? extrinsic.signer.toString() : null,
      callIndex,
      args
    };
  }

  public subscribeNewBlockNumber(confirmation?: Confirmation): Observable<number> {
    let newBlockNumber$;
    if (confirmation === 'finalize') {
      newBlockNumber$ = this.createMethodSubscribe<Header>([
        'chain_finalizedHead',
        'chain_subscribeFinalizedHeads',
        'chain_unsubscribeFinalizedHeads'
      ]).pipe(map(header => Number(header.number)));
    } else if (typeof confirmation === 'number') {
      newBlockNumber$ = this.createMethodSubscribe<Header>([
        'chain_newHead',
        'chain_subscribeNewHead',
        'chain_unsubscribeNewHead'
      ]).pipe(map(header => (Number(header.number) - confirmation >= 0 ? Number(header.number) - confirmation : 0)));
    } else {
      newBlockNumber$ = this.createMethodSubscribe<Header>([
        'chain_newHead',
        'chain_subscribeNewHead',
        'chain_unsubscribeNewHead'
      ]).pipe(map(header => Number(header.number)));
    }
    return newBlockNumber$.pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true
      }),
      pairwise(),
      mergeMap(([pre, current]) => {
        if (pre >= current) return of(current);
        return of(...[...Array(current - pre).keys()].map(i => i + 1 + pre));
      })
    );
  }

  public subscribe(options: SubcribeOptions = {}): Observable<SubscribeBlock | SubscribeBlockError> {
    const { start, end, concurrent = 10, confirmation } = options;

    let blockNumber$: Observable<number>;

    if (start !== undefined && end !== undefined) {
      blockNumber$ = range(start, end - start + 1);
    } else if (start !== undefined && end === undefined) {
      const newBlockNumber$ = this.subscribeNewBlockNumber(confirmation);

      blockNumber$ = from(newBlockNumber$).pipe(
        take(1),
        switchMap(lastestNumber => {
          return concat(range(start, lastestNumber - start + 1), newBlockNumber$);
        })
      );
    } else {
      blockNumber$ = this.subscribeNewBlockNumber(confirmation);
    }

    const getBlockDetail = (blockNumber: number) => {
      return new Observable<SubscribeBlock>(subscriber => {
        this.getBlockDetail({ blockNumber })
          .then(data => {
            subscriber.next({
              blockNumber,
              result: data,
              error: null
            });
            subscriber.complete();
          })
          .catch(error => {
            subscriber.error(error);
          });
      }).pipe(
        timeout(options.timeout || 60000),
        retryWhen(errors =>
          errors.pipe(
            mergeMap(error => {
              if (error.name !== 'TimeoutError') {
                return throwError(error);
              }
              return timer(5000);
            })
          )
        ),
        catchError((err: any) => {
          return of({
            blockNumber,
            error: err,
            result: null
          });
        })
      );
    };

    return blockNumber$.pipe(mergeMap(value => getBlockDetail(value), concurrent));
  }
}

export default Scanner;
