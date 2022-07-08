import { WsProvider } from '@polkadot/rpc-provider';
import Scanner from '../../Scanner';

describe('Scanner', () => {
  let scanner: Scanner;

  beforeAll(async () => {
    jest.setTimeout(30000000);
    const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');
    scanner = new Scanner({ wsProvider: provider });
    await provider.isReady;
  });

  afterAll(async () => {
    scanner.wsProvider.disconnect();
  });

  it('getBlockHash', async () => {
    // expect(await scanner.getBlockHash(0)).toBe('0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe');
    await expect(scanner.getBlockHash(-1)).rejects.toThrow();
    await expect(scanner.getBlockHash(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    await expect(scanner.getBlockHash(1000000000000000)).rejects.toThrow();
  });

  it('getBlockDetail', async () => {
    expect(await scanner.getBlockDetail()).toBeDefined();
  });

  it('getRuntimeVersion', async () => {
    expect(await scanner.getRuntimeVersion()).toBeDefined();
  });

  it.only('getChainInfo', async () => {
    const request1 = await scanner.getChainInfo({ blockNumber: 1 });
    expect(request1.min).toBe(1);
    expect(request1.max).toBe(1);
    const request2 = await scanner.getChainInfo({ blockNumber: 2 });
    expect(request1.metadata).toEqual(request2.metadata);
    expect(request1.registry).toEqual(request2.registry);
    expect(request2.min).toBe(1);
    expect(request2.max).toBe(2);
  });

  it('getEvents', async () => {
    // await expect(scanner.getEvents({ blockNumber: -1 })).rejects.toThrow();
    // await expect(scanner.getEvents({ blockNumber: Number.MAX_SAFE_INTEGER })).rejects.toThrow();
    const chainInfo = await scanner.getChainInfo({ blockNumber: 111 });
    const events = await scanner.getEvents({ blockNumber: 111 }, chainInfo);
    console.log(events);
    expect(events).toBeDefined();
  });

  it.skip('subscribeNewBlockNumber', (done) => {
    let no = 0;
    let initBlockNumber: number;
    const s = scanner.subscribeNewBlockNumber().subscribe((number) => {
      console.log(number);
    });

    setTimeout(() => {
      scanner.wsProvider.disconnect();
      console.log('disconnect');
    }, 30000);
    setTimeout(() => {
      scanner.wsProvider.connect();
      console.log('connect');
    }, 60000);
  });

  it.skip('subcribeFinalizedHead', (done) => {
    let no = 0;
    let initBlockNumber: number;
    const s = scanner.subscribeNewBlockNumber('finalize').subscribe((number) => {
      if (no === 0) {
        initBlockNumber = number;
      }
      if (no >= 5) {
        s.unsubscribe();
        expect(initBlockNumber + 5).toBe(number);
        done();
      } else {
        no++;
      }
    });
  });

  it('subcribe with a big confirmation', (done) => {
    const s = scanner.subscribeNewBlockNumber(Number.MAX_SAFE_INTEGER).subscribe((number) => {
      s.unsubscribe();
      expect(number).toBe(0);
      done();
    });
  });

  it('subcribe with a normal confirmation', async (done) => {
    let no = 0;
    let initBlockNumber: number;

    const currentBlockNumber = Number((await scanner.getBlockDetail()).number);

    const s = scanner.subscribeNewBlockNumber(100).subscribe((number) => {
      if (no === 0) {
        initBlockNumber = number;
      }
      expect(currentBlockNumber - number > 80).toBeTruthy();

      if (no >= 5) {
        s.unsubscribe();
        expect(initBlockNumber + 5).toBe(number);
        done();
      } else {
        no++;
      }
    });
  });

  it.skip('subscribe start and end', (done) => {
    scanner
      .subscribe({
        start: 0,
        concurrent: 50
      })
      .subscribe((no) => {
        console.error(no);
        done();
      });
  });
});
