import { DataTypes } from "sequelize";

import { PermissionAttributes } from "@/interfaces/model/permission.interface";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Feature from "./feature.model";
import RolePermission from "./rolePermission.model";
import User from "./user.model";
import UserPermission from "./userPermission.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "permission",
  indexes: [],
  hooks: {
    beforeCreate: (document: Permission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: Permission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: Permission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class Permission extends Model<PermissionAttributes>
  implements PermissionAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  permissionName: string;

  @ForeignKey(() => Feature)
  @Column
  featureId: number;

  @BelongsTo(() => Feature, {
    foreignKey: "featureId",
    constraints: false,
    as: "feature",
  })
  feature?: Feature;

  @CreatedAt
  createdAt: Date;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, {
    foreignKey: "createdBy",
    constraints: false,
    as: "createdByUser",
  })
  createdByUser?: User;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @BelongsTo(() => User, {
    foreignKey: "updatedBy",
    constraints: false,
    as: "updatedByUser",
  })
  updatedByUser?: User;

  @DeletedAt
  deletedAt: Date;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;

  @HasOne(() => RolePermission)
  rolePermission?: RolePermission;

  @HasOne(() => UserPermission)
  userPermission?: UserPermission;
}
