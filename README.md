# @open-web3 JS library

This monorepo contains all the Javascript packages provided by Open Web3 Stack.

## Packages Overview

- [@open-web3/orml-types](./packages/orml-types)
  - Polkadot.js types for [Open Runtime Module Library (ORML)](https://github.com/open-web3-stack/open-runtime-module-library).
- [@open-web3/orml-api-derive](./packages/orml-api-derive)
  - Polkadot.js derives library for ORML.
- [@open-web3/indexer](./packages/indexer)
  - A node.js indexer server for Substrate based chain.
- [@open-web3/scanner](./packages/scanner)
  - A monitoring library for Substrate based chain.
- [@open-web3/api](./packages/api)
  - Extended API library for polkadot.js.
- [@open-web3/dispatcher](./packages/dispatcher)
  - A schedular / task runner library.
- [@open-web3/fetcher](./packages/fetcher)
  - Data fetcher library, useful for oracle server.
- [@open-web3/util](./packages/util)
  - JS utilities.
- [@open-web3/app-util](./packages/app-util)
  - Utilities for node.js application.
- [@open-web3/asset-metadata](./packages/asset-metadata)
  - asset metadata.

## Development

To start off, this repo uses yarn workspaces to organise the code. As such, after cloning, its dependencies should be installed via yarn, not via npm; the latter will result in broken dependencies.

To get started

1. Clone the repo locally, via `git clone https://github.com/open-web3-stack/open-web3.js.git`
2. Ensure that you have a recent version of Node.js, for development purposes Node 10 is recommended.
3. Ensure that you have a recent version of Yarn, for development purposes Yarn >=1.10.1 is required.
4. Install the dependencies by running `yarn install`
5. Build the everything via `yarn run build`
6. Run all test cases via `yarn jest`
7. Run lint via `yarn lint`
