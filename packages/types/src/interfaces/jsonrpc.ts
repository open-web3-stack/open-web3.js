import { DefinitionRpcExt, DefinitionRpcSub } from '@polkadot/types/types';

import * as definitions from './definitions';

const jsonrpc: Record<string, Record<string, DefinitionRpcExt>> = {};

Object.keys(definitions)
  .filter((key) => Object.keys(definitions[key as 'babe'].rpc || {}).length !== 0)
  .forEach((section): void => {
    jsonrpc[section] = {};

    Object.entries(definitions[section as 'babe'].rpc).forEach(([method, def]): void => {
      const isSubscription = !!(def as DefinitionRpcSub).pubsub;

      jsonrpc[section][method] = { ...(def as any), isSubscription, jsonrpc: `${section}_${method}`, method, section };
    });
  });

export default jsonrpc;
