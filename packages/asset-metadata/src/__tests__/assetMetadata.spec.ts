import { ApiRx, WsProvider } from '@polkadot/api';
import AssetMetadata from '../AssetMetadata';
import ausdDef from './asudMetadata';

describe('AssetMetadata', (): void => {
  it.skip('new', () => {
    const provider = new WsProvider('ws://127.0.0.1:9944');

    const ausd = new AssetMetadata(new ApiRx({ provider }), ausdDef);

    expect(ausd).toBeDefined();
  });
});
