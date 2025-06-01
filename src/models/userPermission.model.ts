import { DataTypes } from "sequelize";

import { UserPermissionAttributes } from "@/interfaces/model/userPermission.interface";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Client from "./client.model";
import LoginUser from "./loginUser.model";
import Permission from "./permission.model";
import Role from "./role.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "user_permission",
  indexes: [],
  hooks: {
    beforeCreate: (document: UserPermission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: UserPermission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: UserPermission) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class UserPermission extends Model<UserPermissionAttributes>
  implements UserPermissionAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @BelongsTo(() => Role, {
    foreignKey: "roleId",
    constraints: false,
    as: "roleData",
  })
  roleData?: Role;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;

  @BelongsTo(() => Permission, {
    foreignKey: "permissionId",
    constraints: false,
    as: "permission",
  })
  permission?: Permission;

  @ForeignKey(() => LoginUser)
  @Column
  loginUserId: number;

  @BelongsTo(() => LoginUser, {
    foreignKey: "loginUserId",
    constraints: false,
    as: "loginUserData",
  })
  loginUserData?: LoginUser;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "clientData",
  })
  clientData?: Client;

  @CreatedAt
  createdAt: Date;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, {
    foreignKey: "createdBy",
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
}
