import { TypeRegistry } from "@polkadot/types";
import Scanner from "../Scanner";

/**
 * Because @polkadot/types/index.js/json/SignedBlock.004.immortal.json does not exist,
 * an error occurred when importing @polkadot/rpc-provider/mock/index
 * https://github.com/polkadot-js/api/issues/1735
 */
function hackMock() {
  const path = require("path");
  const fs = require("fs");
  const filePath = path.resolve(require.resolve("@polkadot/types"), "../json/SignedBlock.004.immortal.json");
  fs.copyFileSync(path.resolve(__dirname, "./SignedBlock.004.immortal.json"), filePath);
  return require("@polkadot/rpc-provider/mock/index").default;
}

hackMock();

describe("Scanner", () => {
  const registry = new TypeRegistry();
  let scanner: Scanner;

  beforeAll(async () => {
    jest.setTimeout(300000);
    const Mock = hackMock();
    const provider = new Mock(registry);
    scanner = new Scanner({ provider });
  });

  it("isConnected", async () => {
    const result = await scanner.getBlockHash(0);
    expect(result).toBeDefined();
  });
});
