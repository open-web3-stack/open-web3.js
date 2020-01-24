import { isHex, isNumber, u8aToU8a } from "@polkadot/util";
import { createType, TypeRegistry, StorageKey, Vec, GenericExtrinsic } from "@polkadot/types";
import Metadata from "@polkadot/metadata/Decorated";
import { createTypeUnsafe } from "@polkadot/types/codec";
import { EventRecord } from "@polkadot/types/interfaces/system";

import { Registry } from "@polkadot/types/types";
import { Observable } from "rxjs";
import { switchMap, map } from "rxjs/operators";

import {
  BlockAt,
  ScannerOptions,
  RpcProvider,
  Hash,
  BlockAtOptions,
  BlockRaw,
  Header,
  Confirmation,
  RuntimeVersion,
  SubcribeOptions
} from "./types";

class Scanner {
  private rpcProvider: RpcProvider;
  private chainInfo: Record<
    string,
    {
      blockHash?: Hash;
      min?: number;
      max?: number;
      bytes: Hash;
      metadata: Metadata;
      runtimeVersion: RuntimeVersion;
      registry: Registry;
    }
  >;

  constructor(options: ScannerOptions) {
    this.rpcProvider = options.provider;
    this.chainInfo = {};
  }

  private createMethodSubscribe<T>(methods: string[], ...params: any[]) {
    const [updateType, subMethod, unsubMethod] = methods;

    return new Observable<T>(observer => {
      let subscriptionPromise: Promise<number | void> = Promise.resolve();
      const errorHandler = (error: Error) => {
        observer.error(error);
      };

      try {
        const update = (error?: Error, result?: any) => {
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

      return () => {
        subscriptionPromise.then(
          (subscriptionId): Promise<boolean> =>
            isNumber(subscriptionId)
              ? this.rpcProvider.unsubscribe(updateType, unsubMethod, subscriptionId)
              : Promise.resolve(false)
        );
      };
    });
  }

  public async getBlock(blockHash?: Hash): Promise<BlockRaw> {
    return this.rpcProvider.send("chain_getBlock", [blockHash]);
  }

  public async getRuntimeVersion(blockHash?: Hash): Promise<RuntimeVersion> {
    return this.rpcProvider.send("state_getRuntimeVersion", [blockHash]);
  }

  public async getBlockHash(at: number | Hash): Promise<Hash> {
    if (typeof at === "number" && !isNaN(at as any) && !isHex(at)) {
      const blockHash = this.rpcProvider.send("chain_getBlockHash", [at]);
      return blockHash;
    } else {
      return at as Hash;
    }
  }

  public async getBlockAt(blockAt?: { blockHash?: Hash; blockNumber?: number }): Promise<BlockAt> {
    if (blockAt?.blockHash && blockAt?.blockNumber !== undefined) {
      return {
        blockHash: blockAt.blockHash,
        blockNumber: blockAt.blockNumber
      };
    }
    if (!blockAt) {
      const header = await this.rpcProvider.send("chain_getHeader", []);
      const blockNumber = Number(header.number);
      const blockHash = await this.rpcProvider.send("chain_getBlockHash", []);
      return {
        blockNumber: blockNumber,
        blockHash: blockHash
      };
    } else if (blockAt.blockNumber !== undefined) {
      const blockHash = await this.rpcProvider.send("chain_getBlockHash", [blockAt.blockNumber]);
      return {
        blockNumber: blockAt.blockNumber,
        blockHash: blockHash
      };
    } else if (blockAt.blockHash) {
      const header = await this.rpcProvider.send("chain_getHeader", [blockAt.blockHash]);
      return {
        blockNumber: Number(header.number),
        blockHash: blockAt.blockHash
      };
    } else {
      throw new Error("expect blockHash or blockNumber");
    }
  }

  public async getChainInfo(_blockAt?: BlockAtOptions) {
    const { blockHash, blockNumber } = await this.getBlockAt(_blockAt);
    const runtimeVersion = await this.getRuntimeVersion(blockHash);
    const cacheKey = `${runtimeVersion.specName}-${runtimeVersion.specVersion}`;
    const registry = new TypeRegistry();
    if (!this.chainInfo[cacheKey]) {
      const rpcdata: string = await this.rpcProvider.send("state_getMetadata", [blockHash]);
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
    // @ts-ignore
    const eventsStorageKey = new StorageKey(registry, metadata.metadata.query.system.events);
    const raw: Hash = await this.rpcProvider.send("state_getStorage", [eventsStorageKey.toHex(), blockAt.blockHash]);

    return createTypeUnsafe<Vec<EventRecord>>(registry, eventsStorageKey.outputType as string, [u8aToU8a(raw)], true);
  }

  public async decodeTx(txData: Hash, _blockAt: BlockAtOptions) {
    const { registry } = await this.getChainInfo(_blockAt);
    return new GenericExtrinsic(registry, txData);
  }

  public subscribeNewBlockNumber(confirmation?: Confirmation) {
    if (confirmation === "finalize") {
      return this.createMethodSubscribe<Header>([
        "chain_finalizedHead",
        "chain_subscribeFinalizedHeads",
        "chain_unsubscribeFinalizedHeads"
      ]).pipe(map(header => Number(header.number)));
    } else if (typeof confirmation === "number") {
      return this.createMethodSubscribe<Header>([
        "chain_newHead",
        "chain_subscribeNewHead",
        "chain_unsubscribeNewHead"
      ]).pipe(map(header => (Number(header.number) - confirmation >= 0 ? Number(header.number) - confirmation : 0)));
    } else {
      return this.createMethodSubscribe<Header>([
        "chain_newHead",
        "chain_subscribeNewHead",
        "chain_unsubscribeNewHead"
      ]).pipe(map(header => Number(header.number)));
    }
  }

  // public subcribe({ start, end }: SubcribeOptions = {}) {
  //   if (start) {
  //   }

  //   return newBlockNumber$.pipe(
  //     switchMap(async blockNumber => {
  //       const blockAt = await this.getBlockAt({ blockNumber });
  //       const block = await this.getBlock(blockAt.blockHash);
  //       return {
  //         raw: block,
  //         hash: blockAt.blockHash,
  //         number: blockAt.blockNumber
  //       };
  //     })
  //   );

  //   this.subscribeNewBlock().pipe();
  // }
}

export default Scanner;
