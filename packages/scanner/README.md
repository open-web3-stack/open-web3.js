# @open-web3/scanner

A monitoring library for Substrate based chain. It is more lightweight and generic, and has some unique features for low level data handling e.g. handle and decode batch calls.

## Installation
Install it via 
```console
yarn add @open-web3/scanner
yarn add @polkadot/api
```

### Other dependencies
If you are scanning a particular substrate chain that has custom types, you might need to install its types. In the example given below, please add this to dependencies.
```
"@acala-network/type-definitions": "0.4.0-beta.32"
``` 

## Example

```javascript
import Scanner from '@open-web3/scanner';
import { types, typesBundle } from '@acala-network/type-definitions';
import { WsProvider } from '@polkadot/rpc-provider';

const provider = new WsProvider('wss://node-6714447553777491968.jm.onfinality.io/ws');
await provider.isReady

const scanner = new Scanner({ wsProvider: provider, types, typesBundle });

scanner
  .subscribe({
    start: 0,
    end: 1000,
    confirmation: 4,
    concurrent: 10 // batch call
  })
  .subscribe((result) => {
    console.log(result.result.events);
  });
```

## Scanner Method

### scanner.subscribe(SubcribeOptions): Observable<SubscribeBlock | SubscribeBlockError>

Scans for events, transactions, and other data within the specified block height range.

## Scanner Type

### SubcribeOptions

Options passed to scanner

#### options.start ⇒ number

Height of the starting block of the scan. The default is 0.

#### options.end ⇒ number

Height of the ending block of the scan. If null, listen for the latest block.

#### options.confirmation ⇒ 'finalize' | number

If it is finalize, only finalized blocks are scanned

#### options.concurrent ⇒ number

The number of blocks that are resolved concurrently.

#### options.timeout ⇒ number

If a block resolution event exceeds timeout, an error is thrown

### SubscribeBlock

#### subscribeBlock.blockNumber ⇒ number

Block height of resolved block.

### subscribeBlock.result => Block

#### SubscribeBlockError

#### subscribeBlockError.blockNumber ⇒ number

Block height of resolved block.

#### subscribeBlockError.error ⇒ any

The error message

### Block

#### block.raw ⇒ string;

Block of raw data

#### block.number ⇒ number;

Block height of resolved block.

#### block.hash ⇒ string;

Block hash of resolved block.

#### block.extrinsics ⇒ any;

All the transaction data for this block.

#### block.events ⇒ any[];

All the events data for this block.

#### block.author ⇒ string;

#### block.timestamp ⇒ number;
