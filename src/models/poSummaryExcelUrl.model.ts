import { DataTypes } from "sequelize";

import { PoSummaryExcelUrlAttributes } from "@/interfaces/model/poSummaryExcelUrl.interface";
import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "po_summary_excel_url",
  indexes: [],
  hooks: {
    beforeCreate: (document: PoSummaryExcelUrl) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: PoSummaryExcelUrl) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: PoSummaryExcelUrl) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class PoSummaryExcelUrl extends Model<PoSummaryExcelUrlAttributes>
  implements PoSummaryExcelUrlAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  clientId: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  startDate: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  endDate: string;

  // @Column({
  //   allowNull: false,
  //   type: DataTypes.INTEGER,
  // })
  // segment: number;

  // @Column({
  //   allowNull: false,
  //   type: DataTypes.INTEGER,
  // })
  // subSegment: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  poSummaryUrl: string;

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
