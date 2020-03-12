import { Sequelize, Model, DataTypes } from 'sequelize';

export class Block extends Model {
  hash!: string;
  number!: number;
  parentHash!: string;
  author!: string;
  bytes!: Buffer;
}

export class Extrinsic extends Model {
  id!: string;
  hash!: string;
  blockHash!: string;
  blockNumber!: number;
  index!: number;
  module!: string;
  method!: string;
  args!: object;
  nonce!: number;
  tip!: number;
  origin?: string;
  bytes!: Buffer;
}

export class Events extends Model {
  id!: string;
  blockHash!: string;
  blockNumber!: number;
  index!: number;
  module!: string;
  name!: string;
  args!: object;
  bytes!: Buffer;
  phase!: string;
  extrinsic?: string;
}

export class Metadata extends Model {
  blockHash!: string;
  blockNumber!: number;
  bytes!: Buffer;
  json!: object;
}

export class Status extends Model {
  lastBlock!: number;
}

export default function init(db: Sequelize): void {
  Block.init({
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
      allowNull: false
    },
    bytes: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  }, {
    sequelize: db
  });

  Extrinsic.init({
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
    module: {
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
      type: DataTypes.INTEGER,
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bytes: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  }, {
    sequelize: db
  });

  Events.init({
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
    module: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
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
    phase: {
      type: DataTypes.STRING,
      allowNull: false
    },
    extrinsic: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize: db
  });

  Metadata.init({
    blockHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blockNumber: {
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
    }
  }, {
    sequelize: db
  });

  Status.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    lastBlock: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize: db
  });
}
