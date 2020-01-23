import { isHex, isNumber, u8aToU8a } from "@polkadot/util";
import { TypeRegistry, StorageKey, Vec, GenericExtrinsic } from "@polkadot/types";
import Metadata from "@polkadot/metadata/Decorated";
import { createTypeUnsafe } from "@polkadot/types/codec";
import { EventRecord } from "@polkadot/types/interfaces/system";

import { Registry } from "@polkadot/types/types";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { ScannerOptions, RpcProvider, Hash, Block, Header, Confirmation, RuntimeVersion } from "./types";

class Scanner {
  private rpcProvider: RpcProvider;
  private metadatas: Record<
    string,
    {
      blockHash?: Hash;
      bytes: Hash;
      metadata: Metadata;
      runtimeVersion: RuntimeVersion;
      registry: Registry;
    }
  >;

  constructor(options: ScannerOptions) {
    this.rpcProvider = options.provider;
    this.metadatas = {};
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

  public async getHeader(at?: number | Hash): Promise<Header> {
    const blockHash = await this.getBlockHash(at);
    return this.rpcProvider.send("chain_getHeader", [blockHash]);
  }

  public async getBlockHash(blockNumberOrHash?: number | Hash): Promise<string | undefined> {
    if (typeof blockNumberOrHash === "number" && !isNaN(blockNumberOrHash as any) && !isHex(blockNumberOrHash)) {
      return this.rpcProvider.send("chain_getBlockHash", [blockNumberOrHash]);
    } else {
      return blockNumberOrHash as Hash;
    }
  }

  public async getBlock(at?: number | Hash): Promise<Block> {
    const blockHash = await this.getBlockHash(at);
    return this.rpcProvider.send("chain_getBlock", [blockHash]);
  }

  public async getRuntimeVersion(at?: number | Hash): Promise<RuntimeVersion> {
    const blockHash = await this.getBlockHash(at);
    return this.rpcProvider.send("state_getRuntimeVersion", [blockHash]);
  }

  public async getMetadata(at?: number | Hash) {
    const blockHash = await this.getBlockHash(at);
    const runtimeVersion = await this.getRuntimeVersion(at);
    const cacheKey = `${runtimeVersion.specName}-${runtimeVersion.specVersion}`;
    const registry = new TypeRegistry();
    if (!this.metadatas[cacheKey]) {
      const rpcdata: string = await this.rpcProvider.send("state_getMetadata", [blockHash]);
      this.metadatas[cacheKey] = {
        blockHash: blockHash,
        bytes: rpcdata,
        metadata: new Metadata(registry, rpcdata),
        registry: registry,
        runtimeVersion: runtimeVersion
      };
    }
    return this.metadatas[cacheKey];
  }

  public async getEvents(at?: number | Hash): Promise<Vec<EventRecord>> {
    const blockHash = await this.getBlockHash(at);
    const { metadata, registry } = await this.getMetadata(blockHash);
    const eventsStorageKey = new StorageKey(registry, metadata.metadata.query.system.events);
    const raw: Hash = await this.rpcProvider.send("state_getStorage", [eventsStorageKey.toHex(), blockHash]);

    return createTypeUnsafe<Vec<EventRecord>>(registry, eventsStorageKey.outputType as string, [u8aToU8a(raw)], true);
  }

  public async decodeTx(txData: Hash, at?: number | Hash) {
    const blockHash = await this.getBlockHash(at);
    const { registry } = await this.getMetadata(blockHash);
    return new GenericExtrinsic(registry, txData);
  }

  public subscribeNewHead(confirmation?: Confirmation) {
    if (confirmation === "finalize") {
      return this.createMethodSubscribe<Header>([
        "chain_finalizedHead",
        "chain_subscribeFinalizedHeads",
        "chain_unsubscribeFinalizedHeads"
      ]);
    } else if (typeof confirmation === "number") {
      return this.createMethodSubscribe<Header>([
        "chain_newHead",
        "chain_subscribeNewHead",
        "chain_unsubscribeNewHead"
      ]).pipe(
        switchMap(header => {
          const targetBlock = Number(header.number) - confirmation >= 0 ? Number(header.number) - confirmation : 0;
          return this.getHeader(targetBlock);
        })
      );
    } else {
      return this.createMethodSubscribe<Header>([
        "chain_newHead",
        "chain_subscribeNewHead",
        "chain_unsubscribeNewHead"
      ]);
    }
  }
}

export default Scanner;
