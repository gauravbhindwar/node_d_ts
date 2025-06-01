import { DataTypes } from "sequelize";

import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  CreatedAt,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import { passwordHook } from "@/hooks/user.hook";
import { LoginUserAttributes } from "../interfaces/model/user.interface";
import Client from "./client.model";
import Employee from "./employee.model";
import SegmentManager from "./segmentManagers.model";
import User from "./user.model";
import UserPermission from "./userPermission.model";
@Table({
  timestamps: true,
  paranoid: true,
  tableName: "login_user",
  defaultScope: { attributes: { exclude: ["code"] } },
  scopes: { withCode: { attributes: { exclude: [] } } },
  indexes: [],
  hooks: {
    beforeCreate: (loginuser: LoginUser) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      loginuser.createdatutc = utcDate;
      loginuser.updatedatutc = utcDate;
    },
    beforeUpdate: (loginuser: LoginUser) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      loginuser.updatedatutc = utcDate;
    },
    beforeDestroy: (loginuser: LoginUser) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      loginuser.updatedatutc = utcDate;
    },
  },
})
export default class LoginUser extends Model<LoginUserAttributes>
  implements LoginUserAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    type: DataTypes.STRING,
  })
  email: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  name: string;

  @Column(DataTypes.TEXT)
  password: string;

  @Column(DataTypes.TEXT)
  randomPassword: string;

  @Column({
    unique: true,
    allowNull: true,
    type: DataTypes.TEXT,
  })
  uniqueLoginId: string;

  @Column
  birthDate: Date;

  @Column
  placeOfBirth: string;

  @Column
  gender: string;

  @Column
  code: string;

  @Column
  phone: string;

  @Column(DataTypes.TEXT) // or STRING(1000) if you want to restrict
  profileImage: string;

  @Column
  timezone: string;

  @Column
  isMailNotification: boolean;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;

  @Column
  logintimeutc: string;

  @Column
  logouttimeutc: string;

  @Column
  timezone_utc: string;

  @Column
  dateformat: string;

  @Column
  timeformat: string;

  @Column
  language: string;

  @Column
  currency: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @HasOne(() => User)
  user?: User[];

  @HasOne(() => SegmentManager)
  segmentmanager?: SegmentManager[];

  @HasMany(() => UserPermission)
  assignedUserPermission?: UserPermission[];

  @HasMany(() => Employee)
  employee?: Employee[];

  @HasMany(() => Client, "loginUserId")
  client?: Client[];

  @BeforeCreate
  @BeforeUpdate
  static beforeCreateHook = async (user: LoginUser) => {
    await passwordHook(user);
  };

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}
