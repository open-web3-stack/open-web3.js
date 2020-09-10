import { ApiRx, WsProvider } from '@polkadot/api';
import AssetMetadata from '../AssetMetadata';
import metadata from './acalaAssetMetadata';

describe('AssetMetadata', (): void => {
  it('new', () => {
    const provider = new WsProvider('ws://127.0.0.1:9944');

    const assets = new AssetMetadata(new ApiRx({ provider }), metadata.assets[0]);

    expect(assets).toBeDefined();
  });
});
