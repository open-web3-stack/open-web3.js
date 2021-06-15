# @open-web3/indexer

A node.js indexer server for Substrate based chain.

## Example

```javascript
import Indexer from '@open-web3/indexer';
import { types, typesBundle } from '@acala-network/type-definitions';

const run = async () => {
  const dbUrl = 'postgres://postgres:postgres@127.0.0.1:5432/postgres';
  const dbOptions = {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    }
  };
  const wsUrl = 'ws://127.0.0.1:9944';

  const indexer = await Indexer.create({
    dbUrl,
    dbOptions,
    wsUrl,
    types,
    typesBundle,
    sync: true
  });

  await indexer.start({
    concurrent: 1,
    confirm: 1
  });
};

run().catch((err) => {
  console.error(err);
});
```
