import { ApiRx, WsProvider } from '@polkadot/api';
import { types } from '@laminar/types';
import { derive } from '..';

interface ExactDerive {
  test?: boolean
}

const Foo: ExactDerive = {}
Foo.

describe('derive', () => {
  let api: ApiRx;

  beforeAll(async () => {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    api = await ApiRx.create({
      provider,
      derives: derive,
      types: types as any
    });
  });
  it('native', async () => {
    console.log(await api.derive.currencies.balance('5FeowPepSWZ1rP11pKRLmhBxtxLVnHvayxHxJBk6SD6THKZF', '0'));
  });

  it('token', async () => {
    console.log(await api.derive.currencies.balance('5FeowPepSWZ1rP11pKRLmhBxtxLVnHvayxHxJBk6SD6THKZF', '2'));
  });
});
