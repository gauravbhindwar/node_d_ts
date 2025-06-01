import { DataTypes, DateDataTypeConstructor } from 'sequelize';

type Auditable = {
  created_at: {
    type: DateDataTypeConstructor
    allowNull: boolean
  }
  updated_at: {
    type: DateDataTypeConstructor
    allowNull: boolean
  }
};

type SoftDeletable = Auditable & {
  deleted_at: {
    type: DateDataTypeConstructor
    allowNull: boolean
  }
};

type TimestampType<T> = T extends true ? SoftDeletable : Auditable;

export function timestamps<T extends boolean>(paranoid?: T): TimestampType<T>;
export function timestamps(paranoid = false) {
  return {
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now,
    },
    ...(paranoid ? {
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    } : {}),
  };
}
