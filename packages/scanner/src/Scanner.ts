import { isHex, isNumber } from "@polkadot/util";
import { Observable } from "rxjs";

import { ScannerOptions, RpcProvider, Hash, Block } from "./types";

class Scanner {
  private rpcProvider: RpcProvider;

  constructor(options: ScannerOptions) {
    this.rpcProvider = options.provider;
  }

  private createMethodSubscribe(methods: string[], ...params: any[]) {
    const [updateType, subMethod, unsubMethod] = methods;

    return new Observable(observer => {
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

  public async getBlockHash(blockNumber: number): Promise<string> {
    return this.rpcProvider.send("chain_getBlockHash", [blockNumber]);
  }

  public async getBlock(blockNumberOrHash: number | Hash): Promise<Block> {
    let blockHash: Hash;
    if (typeof blockNumberOrHash === "number" && !isNaN(blockNumberOrHash as any) && !isHex(blockNumberOrHash)) {
      blockHash = await this.getBlockHash(blockNumberOrHash);
    } else {
      blockHash = blockNumberOrHash as Hash;
    }
    return await this.rpcProvider.send("chain_getBlock", [blockHash]);
  }

  public subscribeNewHead() {
    return this.createMethodSubscribe(["chain_newHead", "chain_subscribeNewHead", "chain_unsubscribeNewHead"]);
  }
}

export default Scanner;
