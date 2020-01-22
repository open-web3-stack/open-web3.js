import { ProviderInterface } from "@polkadot/rpc-provider/types";
import { Registry } from "@polkadot/types/types";

export type RpcProvider = ProviderInterface;

export type Hex = string;
export type Hash = string;

export type Confirmation = "finalize" | number | null;

export interface ScannerOptions {
  provider: RpcProvider;
  registry?: Registry;
}

export interface Header {
  digest: {
    logs: Hash[];
  };
  extrinsicsRoot: Hash;
  number: Hex;
  parentHash: Hash;
  stateRoot: Hash;
}

export interface Block {
  block: {
    extrinsics: Hash[];
  };
  header: Header;
  justification: null | Hash;
}

export interface RuntimeVersion {
  apis: [Hash, number][];
  authoringVersion: number;
  implName: string;
  implVersion: number;
  specName: string;
  specVersion: number;
}
