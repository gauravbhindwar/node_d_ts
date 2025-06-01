import {
  HolidayTypeMasterAttributes,
} from "@/interfaces/model/holidayTypeMaster.interface";
import { DataTypes } from "sequelize";

import { Column, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "holidays_master",
  indexes: [],
  hooks: {
    beforeCreate: (document: HolidayTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: HolidayTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: HolidayTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
  },
})
export default class HolidayTypeMaster
  extends Model<HolidayTypeMasterAttributes>
  implements HolidayTypeMasterAttributes {
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
  label: string;

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
