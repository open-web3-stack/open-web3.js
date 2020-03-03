import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { Registry, RegistryTypes } from '@polkadot/types/types';
import Metadata from '@polkadot/metadata/Decorated';

export type RpcProvider = ProviderInterface;

export type Hex = string;
export type Bytes = string;

export type Confirmation = 'finalize' | number | null;

export type TypeProvider = RegistryTypes | ((specVersion: number) => RegistryTypes);

export interface ScannerOptions {
  provider: RpcProvider;
  types?: TypeProvider;
}

export interface Header {
  digest: {
    logs: Bytes[];
  };
  extrinsicsRoot: Bytes;
  number: Hex;
  parentHash: Bytes;
  stateRoot: Bytes;
}

export interface BlockRaw {
  block: {
    extrinsics: Bytes[];
    header: Header;
  };
  justification: null | Bytes;
}
export interface Block {
  raw: BlockRaw;
  number: number;
  Bytes: Bytes;
  events: any;
  extrinsics: any;
}

export interface RuntimeVersion {
  apis: [Bytes, number][];
  authoringVersion: number;
  implName: string;
  implVersion: number;
  specName: string;
  specVersion: number;
}

export interface BlockAt {
  blockNumber: number;
  blockHash: Bytes;
}

export interface BlockAtOptions {
  blockNumber?: number;
  blockHash?: Bytes;
}

export interface SubcribeOptions {
  start?: number;
  end?: number;
  confirmation?: Confirmation;
  concurrent?: number;
}

export type ChainInfo = {
  blockHash?: Bytes;
  min?: number;
  max?: number;
  bytes: Bytes;
  metadata: Metadata;
  runtimeVersion: RuntimeVersion;
  registry: Registry;
};
