import { ApiRx, WsProvider } from '@polkadot/api';
import AssetMetadata from '../AssetMetadata';
import ausdDef from './ausdMetadata.spec';

describe('AssetMetadata', (): void => {
  it('new', () => {
    const provider = new WsProvider('ws://127.0.0.1:9944');

    const ausd = new AssetMetadata(new ApiRx({ provider }), ausdDef);

    expect(ausd).toBeDefined();
  });
});
