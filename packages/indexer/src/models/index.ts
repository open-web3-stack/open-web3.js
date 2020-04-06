import { Sequelize, Model, DataTypes } from 'sequelize';

export class Block extends Model {
  // public blockHash!: string;
  // public blockNumber!: number;
  // public timestamp!: number | null;
  // public parentHash!: string;
  // public author!: string | null;
  // public raw!: object;
}

export class Extrinsic extends Model {
  // public id!: string;
  // public hash!: string;
  // public blockHash!: string;
  // public blockNumber!: number;
  // public index!: number;
  // public section!: string;
  // public method!: string;
  // public args!: object;
  // public nonce!: number;
  // public tip!: string;
  // public signer?: string;
  // public bytes!: Buffer;
}

export class Events extends Model {
  // public id!: string;
  // public blockHash!: string;
  // public blockNumber!: number;
  // public index!: number;
  // public section!: string;
  // public method!: string;
  // public args!: object;
  // public bytes!: Buffer;
  // public phaseType!: string;
  // public phaseIndex!: number;
}

export class Metadata extends Model {
  // public minBlockNumber!: number;
  // public maxBlockNumber!: number;
  // public bytes!: Buffer;
  // public json!: object;
  // public runtimeVersion!: object;
}

export class Status extends Model {
  // public blockNumber!: number;
  // public blockHash?: string;
  // public status!: number;
}

export default function init(db: Sequelize): void {
  Block.init(
    {
      blockHash: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      blockNumber: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      timestamp: {
        type: DataTypes.BIGINT,
        allowNull: true
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
      sequelize: db,
      indexes: [
        {
          fields: ['blockNumber']
        }
      ]
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
        type: DataTypes.BIGINT,
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
      sequelize: db,
      indexes: [
        {
          fields: ['blockNumber']
        },
        {
          fields: ['blockHash', 'index']
        },
        {
          fields: ['signer']
        }
      ]
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
        type: DataTypes.BIGINT,
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
        allowNull: true
      }
    },
    {
      sequelize: db,
      indexes: [
        {
          fields: ['blockHash', 'phaseIndex']
        }
      ]
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
        type: DataTypes.BIGINT,
        allowNull: false
      },
      maxBlockNumber: {
        type: DataTypes.BIGINT,
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
        type: DataTypes.BIGINT,
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
