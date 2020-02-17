import { ApiPromise, WsProvider } from '@polkadot/api';
import { types } from '@laminar/types';
import { derive } from '..';

describe('derive', () => {
  let api: ApiPromise;

  beforeAll(async () => {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    api = await ApiPromise.create({
      provider,
      derives: derive,
      types: types as any
    });
  });
  it('native', async () => {
    //@ts-ignore
    console.log(await api.derive.currencies.balance('5FeowPepSWZ1rP11pKRLmhBxtxLVnHvayxHxJBk6SD6THKZF', '0'));
  });

  it('token', async () => {
    //@ts-ignore
    console.log(await api.derive.currencies.balance('5FeowPepSWZ1rP11pKRLmhBxtxLVnHvayxHxJBk6SD6THKZF', '2'));
  });
});
