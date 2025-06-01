import { SegmentAttributes } from "@/interfaces/model/segment.interface";
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
import Contact from "./contact.model";
import Employee from "./employee.model";
import EmployeeSegment from "./employeeSegment.model";
import SegmentManager from "./segmentManagers.model";
import SubSegment from "./subSegment.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "segment",
  indexes: [],
  hooks: {
    beforeCreate: (document: Segment) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: Segment) => {
      const utcDate = new Date().toISOString(); // Update updatedAt with UTC
      document.updatedatutc = utcDate;
    },
  },
})
export default class Segment extends Model<SegmentAttributes>
  implements SegmentAttributes {
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
  slug: string;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, {
    foreignKey: "contactId",
    constraints: false,
    as: "contact",
  })
  contact?: Contact;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  code: string;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 1,
  })
  timeSheetStartDay: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  name: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  costCentre: string;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  fridayBonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  saturdayBonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  overtime01Bonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  overtime02Bonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  vatRate: number;

  @Column({
    allowNull: true,
    type: DataTypes.SMALLINT,
  })
  xeroFormat: number;

  @Column({
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  })
  isActive: boolean;

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

  @HasMany(() => EmployeeSegment)
  employeeSegment?: EmployeeSegment[];

  @HasMany(() => Employee)
  employee?: Employee[];

  @HasMany(() => SubSegment)
  subSegmentList?: SubSegment[];

  @HasMany(() => SegmentManager)
  segmentManagers?: SegmentManager[];
}
