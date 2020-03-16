import { Sequelize, Model, DataTypes } from 'sequelize';

export class Block extends Model {
  hash!: string;
  number!: number;
  parentHash!: string;
  author!: string;
  raw!: object;
}

export class Extrinsic extends Model {
  id!: string;
  hash!: string;
  blockHash!: string;
  blockNumber!: number;
  index!: number;
  section!: string;
  method!: string;
  args!: object;
  nonce!: number;
  tip!: string;
  signer?: string;
  bytes!: Buffer;
}

export class Events extends Model {
  id!: string;
  blockHash!: string;
  blockNumber!: number;
  index!: number;
  section!: string;
  method!: string;
  args!: object;
  bytes!: Buffer;
  phaseType!: string;
  phaseIndex!: number;
}

export class Metadata extends Model {
  minBlockNumber!: number;
  maxBlockNumber!: number;
  bytes!: Buffer;
  json!: object;
  runtimeVersion!: object;
}

export class Status extends Model {
  blockNumber!: number;
  blockHash?: string;
  status!: number;
}

export default function init(db: Sequelize): void {
  Block.init(
    {
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      parentHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: true
      },
      raw: {
        type: DataTypes.JSONB,
        allowNull: false
      }
    },
    {
      sequelize: db
    }
  );

  Extrinsic.init(
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blockHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false
      },
      args: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      nonce: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tip: {
        type: DataTypes.STRING,
        allowNull: false
      },
      signer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bytes: {
        type: DataTypes.BLOB,
        allowNull: false
      }
    },
    {
      sequelize: db
    }
  );

  Events.init(
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      blockHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false
      },
      args: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      bytes: {
        type: DataTypes.BLOB,
        allowNull: false
      },
      phaseType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phaseIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: db
    }
  );

  Metadata.init(
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      minBlockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      maxBlockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bytes: {
        type: DataTypes.BLOB,
        allowNull: false
      },
      json: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      runtimeVersion: {
        type: DataTypes.JSONB,
        allowNull: false
      }
    },
    {
      sequelize: db
    }
  );

  Status.init(
    {
      blockNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      blockHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize: db
    }
  );
}
