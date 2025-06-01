import { SegmentTimesheetStartDayAttributes } from "@/interfaces/model/segmentTimesheetStartDay.interface";
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
import Client from "./client.model";
import Segment from "./segment.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "segment_timesheet_start_day",
  indexes: [],
  hooks: {
    beforeCreate: (document: SegmentTimesheetStartDay) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: SegmentTimesheetStartDay) => {
      const utcDate = new Date().toISOString(); // Update updatedAt with UTC
      document.updatedatutc = utcDate;
    },
  },
})
export default class SegmentTimesheetStartDay
  extends Model<SegmentTimesheetStartDayAttributes>
  implements SegmentTimesheetStartDayAttributes {
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

  @Column
  timesheetStartDay: number;

  @ForeignKey(() => Segment)
  @Column
  segmentId: number;

  @BelongsTo(() => Segment, {
    foreignKey: "segmentId",
    constraints: false,
    as: "segment",
  })
  segment?: Segment;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  date: Date;

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

  @DeletedAt
  deletedAt: Date;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;
}
