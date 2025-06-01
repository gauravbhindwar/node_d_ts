import {
  IncrementRequestAttributes,
  status,
} from "@/interfaces/model/salaryIncreaseRequest.interface";
import { DataTypes } from "sequelize";

import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Client from "./client.model";
import Employee from "./employee.model";
import EmployeeSalary from "./employeeSalary.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "increment_requests",
  indexes: [],
  hooks: {
    beforeCreate: (document: IncrementRequests) => {
      const utcDate = new Date().toISOString();
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: IncrementRequests) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: IncrementRequests) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
  },
})
export default class IncrementRequests extends Model<IncrementRequestAttributes>
  implements IncrementRequestAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => Employee)
  @Column
  employeeId: number;

  @BelongsTo(() => Employee, {
    foreignKey: "employeeId",
    constraints: false,
    as: "employee",
  })
  employee?: Employee;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  employeeName: string;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

  @Column({
    type: DataTypes.ENUM(...Object.values(status)),
    defaultValue: status.PENDING,
  })
  status: status;

  @ForeignKey(() => User)
  @Column
  managerId: number;

  @BelongsTo(() => User, {
    foreignKey: "managerId",
    constraints: false,
    as: "manager",
  })
  manager?: User;

  @Column({
    type: DataTypes.ENUM(...Object.values(status)),
    defaultValue: status.PENDING,
  })
  managerStatus: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  managerRequestedDate: string;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  roleId: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  salaryIncrement: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  currentSalary: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  bonusIncrement: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  salaryIncrementPercent: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  bonusIncrementPercent: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  currentBonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  salaryDescription: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  bonusDescription: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
  })
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
    type: DataTypes.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
  })
  updatedBy: number;

  @BelongsTo(() => User, {
    foreignKey: "updatedBy",
    constraints: false,
    as: "updatedByUser",
  })
  updatedByUser?: User;

  @Column
  deletedAt: string;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;

  @HasMany(() => EmployeeSalary, {
    sourceKey: "employeeId",
    foreignKey: "employeeId",
    as: "employeeSalary",
  })
  employeeSalary?: EmployeeSalary[];
}
