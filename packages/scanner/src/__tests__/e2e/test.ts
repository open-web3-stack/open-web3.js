import { WsProvider } from '@polkadot/rpc-provider';
import Scanner from '../../Scanner';
import { types } from '@acala-network/types';

const provider = new WsProvider('wss://node-6640517791634960384.jm.onfinality.io/ws');
const scanner = new Scanner({ wsProvider: provider, types });

scanner
  .subscribe()
  .subscribe(result => {
    if (result.result) {
      console.log('成功', result.result.number);
    } else {
      console.log('失败', result.error, result.blockNumber);
    }
  });
