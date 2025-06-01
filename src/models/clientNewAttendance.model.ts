import { bonus_type } from "@/interfaces/model/bonusTypeMaster.interface";
import {
  client_attendance_type,
  clientNewAttendanceTypeAttributes,
  employee_type,
} from "@/interfaces/model/clientleavetype.interface";
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

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "client_attendance",
  indexes: [],
  hooks: {
    beforeCreate: (document: ClientAttendanceType) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: ClientAttendanceType) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: ClientAttendanceType) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class ClientAttendanceType
  extends Model<clientNewAttendanceTypeAttributes>
  implements clientNewAttendanceTypeAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => Client)
  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    as: "client",
  })
  client: Client;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  statusId: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  status_code: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM(...Object.values(client_attendance_type)),
    defaultValue: client_attendance_type.WORKED,
  })
  status_type: string;

  @Column({
    type: DataTypes.ENUM(...Object.values(bonus_type)),
  })
  bonus_type: bonus_type;

  @Column({
    type: DataTypes.ENUM("PAID", "UNPAID"),
  })
  payment_type: string;

  @Column({
    type: DataTypes.STRING,
  })
  reliquatValue?: string;

  @Column({
    type: DataTypes.TEXT,
  })
  conditions?: string;

  // @Column({
  //   type: DataTypes.STRING,
  // })
  // factor1?: string;

  // @Column({
  //   type: DataTypes.STRING,
  // })
  // factor2?: string;

  @Column({
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  })
  dates: string[];

  @Column({
    type: DataTypes.ENUM(...Object.values(employee_type)),
    defaultValue: employee_type.ALL,
  })
  employee_type: employee_type;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;
}
