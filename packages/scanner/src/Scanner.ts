import { createHeaderExtended } from '@polkadot/api-derive';
import { HeaderExtended } from '@polkadot/api-derive/types';
import { expandMetadata, GenericExtrinsic, Metadata, StorageKey, TypeRegistry, Vec } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { ValidatorId } from '@polkadot/types/interfaces';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { Registry, RegisteredTypes } from '@polkadot/types/types';
import { isHex, isNumber, u8aToHex } from '@polkadot/util';
import { concat, from, Observable, of, range, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, pairwise, retryWhen, shareReplay, switchMap, take, timeout } from 'rxjs/operators';
import GenericEvent from './GenericEvent';
import {
  Block,
  BlockAt,
  BlockAtOptions,
  BlockRaw,
  Bytes,
  ChainInfo,
  Confirmation,
  Event,
  Extrinsic,
  Header,
  Meta,
  RpcProvider,
  RuntimeVersion,
  ScannerOptions,
  SubcribeOptions,
  SubscribeBlock,
  SubscribeBlockError,
  WsProvider
} from './types';

class Scanner {
  private rpcProvider: RpcProvider;
  private knownTypes: RegisteredTypes;
  private metadataRequest: Record<string, Promise<ChainInfo>>;
  public wsProvider: WsProvider;
  public chainInfo: Record<string, ChainInfo>;

  constructor(options: ScannerOptions) {
    this.wsProvider = options.wsProvider;
    this.rpcProvider = options.rpcProvider || options.wsProvider;
    this.knownTypes = {
      types: options.types,
      typesAlias: options.typesAlias,
      typesBundle: options.typesBundle,
      typesChain: options.typesChain,
      typesSpec: options.typesSpec
    };
    this.chainInfo = {};
    this.metadataRequest = {};
  }

  private createMethodSubscribe<T>(methods: string[], ...params: any[]): Observable<T> {
    const [updateType, subMethod, unsubMethod] = methods;

    return new Observable<T>((observer) => {
      let subscriptionPromise: Promise<string | number | void> = Promise.resolve();
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
          .catch((error) => errorHandler(error));
      } catch (error) {
        errorHandler(error as Error);
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
      this.getEvents(blockAt, chainInfo).then((eventRecords) =>
        eventRecords.map((event, index) => this.getEventData(event, index))
      )
    );

    const blockRaw: BlockRaw = await this.rpcProvider.send('chain_getBlock', [blockAt.blockHash]);

    requestes.push(
      this.getHeader(blockRaw.block.header, blockAt, chainInfo).then((header) => {
        return header.author?.toString();
      })
    );

    const [events, author] = await Promise.all(requestes as [Promise<Event[]>, Promise<string>]);

    const extrinsics = blockRaw.block.extrinsics.map((extrinsic, index) => {
      const event = [...events].reverse().find(({ phaseIndex }) => phaseIndex === index);
      const result =
        event && (event.method === 'ExtrinsicFailed' || event.method === 'ExtrinsicSuccess') ? event.method : '';

      return {
        index,
        result,
        ...this.decodeTx(extrinsic, blockAt, chainInfo)
      };
    });

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
    return createHeaderExtended(meta.registry, meta.registry.createType('Header', header), validators);
  }

  public async getRuntimeVersion(blockHash?: Bytes): Promise<RuntimeVersion> {
    const [runtimeVesion, chainName] = await Promise.all([
      this.rpcProvider.send('state_getRuntimeVersion', [blockHash]),
      this.rpcProvider.send('system_chain', [])
    ]);

    return {
      ...runtimeVesion,
      chainName
    };
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

  public async getParentHash(_blockHash?: Bytes): Promise<Bytes> {
    const header = await this.rpcProvider.send('chain_getHeader', _blockHash ? [_blockHash] : []);
    return header.parentHash as Bytes;
  }

  public getSpecTypes(version: RuntimeVersion) {
    const types = getSpecTypes(
      {
        knownTypes: this.knownTypes
      } as Registry,
      version.chainName,
      version.specName,
      version.specVersion
    );
    return {
      ...types,
      GenericEvent: GenericEvent
    };
  }

  public async getChainInfo(_blockAt?: BlockAtOptions): Promise<ChainInfo> {
    const { blockHash, blockNumber } = await this.getBlockAt(_blockAt);
    let hashForMetadata = await this.getParentHash(blockHash);
    if (blockNumber === 0) {
      hashForMetadata = blockHash;
    }
    const runtimeVersion = await this.getRuntimeVersion(hashForMetadata);
    const cacheKey = `${runtimeVersion.specName}/${runtimeVersion.specVersion}`;
    if (!this.chainInfo[cacheKey]) {
      const registry = new TypeRegistry();
      registry.register(this.getSpecTypes(runtimeVersion));
      const properties = await this.rpcProvider.send('system_properties', []);
      registry.setChainProperties(registry.createType('ChainProperties', properties));
      registry.knownTypes.typesAlias = this.knownTypes.typesAlias;

      // eslint-disable-next-line
      if (!this.metadataRequest[cacheKey]) {
        this.metadataRequest[cacheKey] = this.rpcProvider
          .send('state_getMetadata', [hashForMetadata])
          .then((rpcdata: string) => {
            const metadata = new Metadata(registry, rpcdata as any);

            registry.setMetadata(metadata);

            return {
              id: cacheKey,
              min: blockNumber,
              max: blockNumber,
              bytes: rpcdata,
              metadata: expandMetadata(registry, metadata),
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

  public async getSessionValidators(_blockAt: BlockAtOptions): Promise<Vec<ValidatorId> | []> {
    const { metadata, registry } = await this.getChainInfo(_blockAt);
    if (!metadata.query.session) return [];
    const storageKey = new StorageKey(registry, metadata.query.session.validators);
    return this.getStorageValue<Vec<ValidatorId>>(storageKey, _blockAt);
  }

  public async getEvents(_blockAt: BlockAtOptions, meta: Meta): Promise<Vec<EventRecord>> {
    const storageKey = new StorageKey(meta.registry, meta.metadata.query.system.events);
    return this.getStorageValue<Vec<EventRecord>>(storageKey, _blockAt);
  }

  public getEventData(event: EventRecord, index: number) {
    const documentation = (event.event.meta.toJSON() as any)?.documentation?.join('\n');

    return {
      index,
      doc: documentation,
      bytes: event.toHex(),
      section: event.event.section,
      method: event.event.method,
      phaseType: event.phase.type,
      phaseIndex: event.phase.isNone ? null : (event.phase.value as any).toNumber(),
      args: event.event.data.toJSON() as any[],
      argsDef: (event.event as any).argsDef
    } as Event;
  }

  public async getStorageValue<T>(storageKey: StorageKey, _blockAt: BlockAtOptions): Promise<T> {
    const blockAt = await this.getBlockAt(_blockAt);
    const { registry } = await this.getChainInfo(_blockAt);
    const raw: Bytes = await this.rpcProvider.send('state_getStorage', [storageKey.toHex(), blockAt.blockHash]);
    // eslint-disable-next-line
    return registry.createType(storageKey.outputType as any, raw, true) as any;
  }

  public decodeTx(txData: Bytes, _blockAt: BlockAtOptions, meta: Meta): Omit<Extrinsic, 'result'> {
    const extrinsic = new GenericExtrinsic(meta.registry, txData);
    const { callIndex, args } = extrinsic.method.toJSON() as any;

    return {
      bytes: txData,
      hash: u8aToHex(extrinsic.hash),
      tip: extrinsic.tip.toString(),
      nonce: extrinsic.nonce.toNumber(),
      method: extrinsic.method.method,
      section: extrinsic.method.section,
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
      ]).pipe(map((header) => Number(header.number)));
    } else if (typeof confirmation === 'number') {
      newBlockNumber$ = this.createMethodSubscribe<Header>([
        'chain_newHead',
        'chain_subscribeNewHead',
        'chain_unsubscribeNewHead'
      ]).pipe(map((header) => (Number(header.number) - confirmation >= 0 ? Number(header.number) - confirmation : 0)));
    } else {
      newBlockNumber$ = this.createMethodSubscribe<Header>([
        'chain_newHead',
        'chain_subscribeNewHead',
        'chain_unsubscribeNewHead'
      ]).pipe(map((header) => Number(header.number)));
    }
    return newBlockNumber$.pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true
      }),
      pairwise(),
      mergeMap(([pre, current]) => {
        if (pre >= current) return of(current);
        return of(...[...Array(current - pre).keys()].map((i) => i + 1 + pre));
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
        switchMap((lastestNumber) => {
          return concat(range(start, lastestNumber - start + 1), newBlockNumber$);
        })
      );
    } else {
      blockNumber$ = this.subscribeNewBlockNumber(confirmation);
    }

    const getBlockDetail = (blockNumber: number) => {
      return new Observable<SubscribeBlock>((subscriber) => {
        this.getBlockDetail({ blockNumber })
          .then((data) => {
            subscriber.next({
              blockNumber,
              result: data,
              error: null
            });
            subscriber.complete();
          })
          .catch((error) => {
            subscriber.error(error);
          });
      }).pipe(
        timeout(options.timeout || 60000),
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error) => {
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

    return blockNumber$.pipe(mergeMap((value) => getBlockDetail(value), concurrent));
  }
}

export default Scanner;
