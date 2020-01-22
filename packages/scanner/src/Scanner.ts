import { isHex, isNumber } from "@polkadot/util";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { ScannerOptions, RpcProvider, Hash, Block, Header, Confirmation } from "./types";

class Scanner {
  private rpcProvider: RpcProvider;

  constructor(options: ScannerOptions) {
    this.rpcProvider = options.provider;
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

  public async getHeader(blockNumber?: number): Promise<Header> {
    const blockHash = await this.getBlockHash(blockNumber);
    return this.rpcProvider.send("chain_getHeader", [blockHash]);
  }

  public async getBlockHash(blockNumberOrHash?: number | Hash): Promise<string> {
    if (typeof blockNumberOrHash === "number" && !isNaN(blockNumberOrHash as any) && !isHex(blockNumberOrHash)) {
      return this.rpcProvider.send("chain_getBlockHash", [blockNumberOrHash]);
    } else {
      return blockNumberOrHash as Hash;
    }
  }

  public async getBlock(blockNumber?: number | Hash): Promise<Block> {
    const blockHash = await this.getBlockHash(blockNumber);
    return await this.rpcProvider.send("chain_getBlock", [blockHash]);
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
