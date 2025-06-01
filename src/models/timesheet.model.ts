import { TimesheetAttributes } from "@/interfaces/model/timesheet.interface";
import { DataTypes } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Client from "./client.model";
import Employee from "./employee.model";
import Segment from "./segment.model";
import SubSegment from "./subSegment.model";
import TimesheetLogs from "./timesheetLogs.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "timesheet",
  indexes: [
    {
      fields: ["dbKey"],
      unique: true,
      where: {
        deletedAt: null,
      },
    },
  ],
  hooks: {
    beforeCreate: (document: Timesheet) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: Timesheet) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: Timesheet) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class Timesheet extends Model<TimesheetAttributes>
  implements TimesheetAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

  @ForeignKey(() => Segment)
  @Column
  segmentId: number;

  @BelongsTo(() => Segment, {
    foreignKey: "segmentId",
    constraints: false,
    as: "segment",
  })
  segment?: Segment;

  @ForeignKey(() => SubSegment)
  @Column
  subSegmentId: number;

  @BelongsTo(() => SubSegment, {
    foreignKey: "subSegmentId",
    constraints: false,
    as: "subSegment",
  })
  subSegment?: SubSegment;

  @ForeignKey(() => Employee)
  @Column
  employeeId: number;

  @BelongsTo(() => Employee, {
    foreignKey: "employeeId",
    constraints: false,
    as: "employee",
  })
  employee?: Employee;

  @Column
  requestedDate: string;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  totalDays: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  status: string;

  @Column({
    allowNull: true,
    unique: true,
    type: DataTypes.STRING,
  })
  dbKey: string;
  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  approvedAt: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  unApprovedAt: Date;

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
  oldTimesheetId: string;

  @ForeignKey(() => User)
  @Column
  approvedBy: number;

  @BelongsTo(() => User, {
    foreignKey: "approvedBy",
    constraints: false,
    as: "approvedByUser",
  })
  approvedByUser?: User;

  @ForeignKey(() => User)
  @Column
  unApprovedBy: number;

  @BelongsTo(() => User, {
    foreignKey: "unApprovedBy",
    constraints: false,
    as: "unApprovedByUser",
  })
  unApprovedByUser?: User;

  @ForeignKey(() => User)
  @Column
  requestedUserId: number;

  @BelongsTo(() => User, {
    foreignKey: "requestedUserId",
    constraints: false,
    as: "requestedUser",
  })
  requestedUser?: User;

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
  updatedByUser: User;

  @DeletedAt
  deletedAt: Date;

  @HasMany(() => TimesheetLogs)
  timesheetLogsData?: TimesheetLogs[];

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;
}
