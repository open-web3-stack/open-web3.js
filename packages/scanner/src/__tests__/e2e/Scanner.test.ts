import { WsProvider } from "@polkadot/rpc-provider";
import Scanner from "../../Scanner";

describe("Scanner", () => {
  let scanner: Scanner;

  beforeAll(async () => {
    jest.setTimeout(300000);
    const provider = new WsProvider("wss://kusama-rpc.polkadot.io/");
    scanner = new Scanner({ provider });
  });

  it("getBlockHash 0", async () => {
    const result = await scanner.getBlockHash(0);
    // kusama genesisHash
    expect(result).toBe("0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe");
  });

  it("getBlockHash error", async () => {
    await expect(scanner.getBlockHash(-1)).rejects.toThrow();
    await expect(scanner.getBlockHash(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    await expect(scanner.getBlockHash(1000000000000000)).rejects.toThrow();
  });

  it("getBlock", async () => {
    await expect(scanner.getBlock(-1)).rejects.toThrow();
    expect(await scanner.getBlock(1)).toBeDefined();
    expect(await scanner.getBlock(0)).toBeDefined();
    await expect(scanner.getBlock(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    await expect(scanner.getBlock(1000000000000000)).rejects.toThrow();
  });

  it("getHeader", async () => {
    expect(await scanner.getHeader()).toBeDefined();
    await expect(scanner.getHeader(-1)).rejects.toThrow();
    expect(await scanner.getHeader(1)).toBeDefined();
    expect(await scanner.getHeader(0)).toBeDefined();
    await expect(scanner.getHeader(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    await expect(scanner.getHeader(1000000000000000)).rejects.toThrow();
  });

  it("getRuntimeVersion", async () => {
    expect(await scanner.getRuntimeVersion(0)).toBeDefined();
    expect(await scanner.getRuntimeVersion()).toBeDefined();
  });

  it.only("getMetadata", async () => {
    const request1 = await scanner.getMetadata(0)
    const request2 = await scanner.getMetadata(0)
    expect(request1).toEqual(request2);
    // expect(await scanner.getMetadata()).toBeDefined();
  });

  it("subcribeNewHead", done => {
    let no = 0;
    let initBlockNumber: number;
    const s = scanner.subscribeNewHead().subscribe(head => {
      if (no === 0) {
        initBlockNumber = Number(head.number);
      }
      if (no >= 5) {
        s.unsubscribe();
        expect(initBlockNumber + 5).toBe(Number(head.number));
        done();
      } else {
        no++;
      }
    });
  });

  it("subcribeFinalizedHead", done => {
    let no = 0;
    let initBlockNumber: number;
    const s = scanner.subscribeNewHead("finalize").subscribe(head => {
      if (no === 0) {
        initBlockNumber = Number(head.number);
      }
      if (no >= 5) {
        s.unsubscribe();
        expect(initBlockNumber + 5).toBe(Number(head.number));
        done();
      } else {
        no++;
      }
    });
  });

  it("subcribe with a big confirmation", done => {
    const s = scanner.subscribeNewHead(Number.MAX_SAFE_INTEGER).subscribe(head => {
      s.unsubscribe();
      expect(Number(head.number)).toBe(0);
      done();
    });
  });

  it("subcribe with a normal confirmation", async done => {
    let no = 0;
    let initBlockNumber: number;

    const currentBlockNumber = Number((await scanner.getHeader()).number);

    const s = scanner.subscribeNewHead(100).subscribe(head => {
      if (no === 0) {
        initBlockNumber = Number(head.number);
      }
      expect(currentBlockNumber - Number(head.number) > 80).toBeTruthy();

      if (no >= 5) {
        s.unsubscribe();
        expect(initBlockNumber + 5).toBe(Number(head.number));
        done();
      } else {
        no++;
      }
    });
  });
});
