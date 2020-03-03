import { isHex, isNumber, u8aToU8a } from '@polkadot/util';
import { TypeRegistry, StorageKey, Vec, GenericExtrinsic } from '@polkadot/types';
import Metadata from '@polkadot/metadata/Decorated';
import { createTypeUnsafe } from '@polkadot/types/create';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { Observable, range, from, concat, of } from 'rxjs';
import { switchMap, map, take, shareReplay, mergeMap, pairwise } from 'rxjs/operators';

import {
  BlockAt,
  ScannerOptions,
  RpcProvider,
  Bytes,
  BlockAtOptions,
  Block,
  BlockRaw,
  Header,
  Confirmation,
  RuntimeVersion,
  SubcribeOptions,
  ChainInfo,
  TypeProvider
} from './types';

class Scanner {
  private rpcProvider: RpcProvider;
  private typeProvider?: TypeProvider;
  private chainInfo: Record<string, ChainInfo>;

  constructor(options: ScannerOptions) {
    this.rpcProvider = options.provider;
    this.typeProvider = options.types;
    this.chainInfo = {};
  }

  private createMethodSubscribe<T>(methods: string[], ...params: any[]): Observable<T> {
    const [updateType, subMethod, unsubMethod] = methods;

    return new Observable<T>(observer => {
      let subscriptionPromise: Promise<number | void> = Promise.resolve();
      const errorHandler = (error: Error): void => {
        observer.error(error);
      };

      try {
        const update = (error?: Error, result?: any): void => {
          if (error) {
            // errorHandler(error)
            return;
          }
          observer.next(result);
        };

        subscriptionPromise = this.rpcProvider
          .subscribe(updateType, subMethod, params, update)
          .catch(error => errorHandler(error));
      } catch (error) {
        errorHandler(error);
      }

      return (): void => {
        subscriptionPromise.then(
          (subscriptionId): Promise<boolean> =>
            isNumber(subscriptionId)
              ? this.rpcProvider.unsubscribe(updateType, unsubMethod, subscriptionId)
              : Promise.resolve(false)
        );
      };
    });
  }

  public async getBlockDetail(_blockAt?: BlockAtOptions): Promise<Block> {
    const blockAt = await this.getBlockAt(_blockAt);
    const blockRaw: BlockRaw = await this.rpcProvider.send('chain_getBlock', [blockAt.blockHash]);
    const events = await this.getEvents(blockAt);
    const extrinsics = await Promise.all(blockRaw.block.extrinsics.map(extrinsic => this.decodeTx(extrinsic, blockAt)));

    return {
      raw: blockRaw,
      number: Number(blockRaw.block.header.number),
      Bytes: blockAt.blockHash,
      events,
      extrinsics
    };
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
    const cacheKey = `${runtimeVersion.specName}-${runtimeVersion.specVersion}`;
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
      const rpcdata: string = await this.rpcProvider.send('state_getMetadata', [blockHash]);
      this.chainInfo[cacheKey] = {
        min: blockNumber,
        max: blockNumber,
        bytes: rpcdata,
        metadata: new Metadata(registry, rpcdata),
        registry: registry,
        runtimeVersion: runtimeVersion
      };
    } else {
      this.chainInfo[cacheKey].min = Math.min(this.chainInfo[cacheKey].min || Number.MAX_SAFE_INTEGER, blockNumber);
      this.chainInfo[cacheKey].max = Math.max(this.chainInfo[cacheKey].max || Number.MIN_SAFE_INTEGER, blockNumber);
    }
    return this.chainInfo[cacheKey];
  }

  public async getEvents(_blockAt: BlockAtOptions): Promise<Vec<EventRecord>> {
    const blockAt = await this.getBlockAt(_blockAt);
    const { metadata, registry } = await this.getChainInfo(blockAt);
    const eventsStorageKey = new StorageKey(registry, metadata.query.system.events);
    const raw: Bytes = await this.rpcProvider.send('state_getStorage', [eventsStorageKey.toHex(), blockAt.blockHash]);

    return createTypeUnsafe<Vec<EventRecord>>(registry, eventsStorageKey.outputType as string, [u8aToU8a(raw)], true);
  }

  public async decodeTx(txData: Bytes, _blockAt: BlockAtOptions): Promise<GenericExtrinsic> {
    const { registry } = await this.getChainInfo(_blockAt);
    return new GenericExtrinsic(registry, txData);
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
        if (pre === current) return of(current);
        return range(current, current - pre);
      })
    );
  }

  public subscribe({ start = 0, end, concurrent = 1 }: SubcribeOptions = {}): Observable<Block> {
    let blockNumber$;

    if (start !== undefined && end !== undefined) {
      blockNumber$ = range(start, end - start + 1);
    } else if (end === undefined) {
      const newBlockNumber$ = this.subscribeNewBlockNumber();

      blockNumber$ = from(newBlockNumber$).pipe(
        take(1),
        switchMap(lastestNumber => {
          return concat(range(start, lastestNumber - start + 1), newBlockNumber$);
        })
      );
    } else {
      blockNumber$ = this.subscribeNewBlockNumber();
    }

    return blockNumber$.pipe(
      mergeMap(value => {
        return this.getBlockDetail({ blockNumber: value });
      }, concurrent)
    );
  }
}

export default Scanner;
