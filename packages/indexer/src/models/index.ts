import { Sequelize, Model, DataTypes } from 'sequelize';

export class Block extends Model {}

export class Extrinsic extends Model {}

export class DispatchableCall extends Model {}

export class Events extends Model {}

export class Metadata extends Model {}

export class Status extends Model {}

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
        // ${blockHash}-${index}
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
      result: {
        type: DataTypes.STRING,
        allowNull: false
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
          fields: ['blockHash']
        },
        {
          fields: ['blockHash', 'index']
        },
        {
          fields: ['signer']
        },
        {
          fields: ['section', 'method']
        }
      ]
    }
  );

  DispatchableCall.init(
    {
      id: {
        // ${parent.id}-${index}
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
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
      extrinsic: {
        // Extrinsic.id
        type: DataTypes.STRING,
        allowNull: false
      },
      parent: {
        // DispatchableCall.id
        type: DataTypes.STRING,
        allowNull: true
      },
      origin: {
        // Address | 'root' | 'none'
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize: db,
      indexes: [
        {
          fields: ['extrinsic']
        },
        {
          fields: ['origin']
        },
        {
          fields: ['section', 'method']
        }
      ]
    }
  );

  Events.init(
    {
      id: {
        // ${blockNumber}-${index}
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
          fields: ['blockNumber']
        },
        {
          fields: ['blockHash']
        },
        {
          fields: ['blockHash', 'phaseIndex']
        },
        {
          fields: ['section', 'method']
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
