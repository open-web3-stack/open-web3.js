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
    // expect(await scanner.getBlock(720000)).toBe('哈哈哈哈')
    // await expect(scanner.getBlockHash(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    // await expect(scanner.getBlockHash(1000000000000000)).rejects.toThrow();
  });
});
