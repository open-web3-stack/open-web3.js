import { WsProvider as _WsProvider, HttpProvider } from '@polkadot/rpc-provider';
import { RegisteredTypes } from '@polkadot/types/types/registry';
import Metadata from '@polkadot/metadata/Decorated';
import { Registry } from '@polkadot/types/types';

export type WsProvider = _WsProvider;
export type RpcProvider = _WsProvider | HttpProvider;

export type Hex = string;
export type Bytes = string;

export type Confirmation = 'finalize' | number | null;

export interface ScannerOptions extends RegisteredTypes {
  wsProvider: WsProvider;
  rpcProvider?: RpcProvider;
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
  hash: Bytes;
  extrinsics: (Extrinsic & { index: number })[];
  events: Event[];
  author?: string;
  chainInfo: ChainInfo;
  timestamp: number;
}

export interface Event {
  index: number;
  bytes: string;
  section: string;
  method: string;
  phaseType: string;
  phaseIndex: number;
  args: any[];
  argsDef: Record<string, any> | null;
}

export interface DispatchableCall {
  callIndex: Bytes;
  section: string;
  method: string;
  args: Record<string, any>;
}

export interface Extrinsic extends DispatchableCall {
  tip: string;
  nonce: number;
  signer: string | null;
  result: string;
  bytes: Bytes;
  hash: Bytes;
}

export interface RuntimeVersion {
  apis: [Bytes, number][];
  authoringVersion: number;
  implName: string;
  implVersion: number;
  specName: string;
  specVersion: number;
  chainName: string;
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
  timeout?: number;
}

export interface ChainInfo {
  id: string;
  blockHash?: Bytes;
  min: number;
  max: number;
  bytes: Bytes;
  metadata: Metadata;
  runtimeVersion: RuntimeVersion;
  registry: Registry;
}

export interface Meta {
  metadata: Metadata;
  registry: Registry;
}

export type SubscribeBlock = {
  blockNumber: number;
  result: Block & {
    chainInfo: ChainInfo;
  };
  error: null;
};

export type SubscribeBlockError = {
  blockNumber: number;
  error: any;
  result: null;
};
