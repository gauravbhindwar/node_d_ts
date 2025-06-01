import { AttendanceTypeMasterAttributes } from "@/interfaces/model/attendanceTypeMaster.interface";
import { DataTypes } from "sequelize";
import { Column, HasMany, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "attendance_type_master",
  indexes: [],
  hooks: {
    beforeCreate: (document: AttendanceTypeModel) => {
      const utcDate = new Date().toISOString();
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: AttendanceTypeModel) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: AttendanceTypeModel) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
  },
})
export default class AttendanceTypeModel
  extends Model<AttendanceTypeMasterAttributes>
  implements AttendanceTypeMasterAttributes {
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
  name: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  code: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  description: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  slug: string;

  @Column
  deletedAt: string;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;
}
