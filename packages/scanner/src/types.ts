import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { Registry } from '@polkadot/types/types';
import Metadata from '@polkadot/metadata/Decorated';

export type RpcProvider = ProviderInterface;

export type Hex = string;
export type Hash = string;

export type Confirmation = 'finalize' | number | null;

export interface ScannerOptions {
  provider: RpcProvider;
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

export interface BlockRaw {
  block: {
    extrinsics: Hash[];
    header: Header;
  };
  justification: null | Hash;
}
export interface Block {
  raw: BlockRaw;
  number: number;
  hash: Hash;
  events: any;
  extrinsics: any;
}

export interface RuntimeVersion {
  apis: [Hash, number][];
  authoringVersion: number;
  implName: string;
  implVersion: number;
  specName: string;
  specVersion: number;
}

export interface BlockAt {
  blockNumber: number;
  blockHash: Hash;
}

export interface BlockAtOptions {
  blockNumber?: number;
  blockHash?: Hash;
}

export interface SubcribeOptions {
  start?: number;
  end?: number;
  confirmation?: Confirmation;
  concurrent?: number;
}

export type ChainInfo = {
  blockHash?: Hash;
  min?: number;
  max?: number;
  bytes: Hash;
  metadata: Metadata;
  runtimeVersion: RuntimeVersion;
  registry: Registry;
};
