import { ProviderInterface } from "@polkadot/rpc-provider/types";

export type RpcProvider = ProviderInterface;

export type Hex = string;
export type Hash = string;

export interface ScannerOptions {
  provider: RpcProvider;
}

export interface Block {
  block: {
    extrinsics: Hash[];
  };
  header: {
    digest: {
      logs: Hash[];
    };
    extrinsicsRoot: Hash;
    number: Hex;
    parentHash: Hash;
    stateRoot: Hash;
  };
  justification: null | Hash;
}
