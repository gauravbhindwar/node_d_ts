import { AccountPOAttributes } from "@/interfaces/model/accountPOInterface";
import { DataTypes } from "sequelize";
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
import LoginUser from "./loginUser.model";
import Segment from "./segment.model";
import SubSegment from "./subSegment.model";
import Timesheet from "./timesheet.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "account_po",
  indexes: [],
  hooks: {
    beforeCreate: (document: AccountPO) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: AccountPO) => {
      const utcDate = new Date().toISOString(); // Update updatedAt with UTC
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: AccountPO) => {
      const utcDate = new Date().toISOString(); // Update updatedAt with UTC
      document.updatedatutc = utcDate;
    },
  },
})
export default class AccountPO extends Model<AccountPO>
  implements AccountPOAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
  })
  managerId: number;

  @BelongsTo(() => LoginUser, {
    foreignKey: "managerId",
    constraints: false,
    as: "managerDetails",
  })
  managerDetails: LoginUser;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  timesheetId: number;

  @BelongsTo(() => Timesheet, {
    foreignKey: "timesheetId",
    constraints: false,
    as: "timesheet",
  })
  timesheet: Timesheet;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  poNumber: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  dailyRate: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  timesheetQty: number;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  startDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  endDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  invoiceNo: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isPaid: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  invoiceId: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  managers: string;

  @ForeignKey(() => Segment)
  @Column
  segmentId: number;

  @BelongsTo(() => Segment, {
    foreignKey: "segmentId",
    constraints: false,
    as: "segmentData",
  })
  segment?: Segment;

  @ForeignKey(() => SubSegment)
  @Column
  subSegmentId: number;

  @BelongsTo(() => SubSegment, {
    foreignKey: "subSegmentId",
    constraints: false,
    as: "subSegmentData",
  })
  subSegment?: SubSegment;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'DZD',
  })
  currency: string;

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

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  poSummaryUrl: string;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @DeletedAt
  deletedAt: Date;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;
}
