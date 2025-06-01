import { DataTypes } from "sequelize";

import {
  BonusTypeMasterAttributes,
  bonus_type,
} from "@/interfaces/model/bonusTypeMaster.interface";
import { Column, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "bonus_type_master",
  indexes: [],
  hooks: {
    beforeCreate: (document: BonusTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: BonusTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: BonusTypeMaster) => {
      const utcDate = new Date().toISOString();
      document.updatedatutc = utcDate;
    },
  },
})
export default class BonusTypeMaster extends Model<BonusTypeMasterAttributes>
  implements BonusTypeMasterAttributes {
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

  // @Column({
  //   type: DataTypes.ENUM(...Object.values(employee_type)),
  //   defaultValue: employee_type.ALL,
  // })
  // employee_type: employee_type;

  @Column({
    type: DataTypes.ENUM(...Object.values(bonus_type)),
    defaultValue: bonus_type.RELIQUAT,
  })
  bonus_type: bonus_type;

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
