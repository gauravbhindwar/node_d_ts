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

import { BonusTypeAttributes } from "@/interfaces/model/bonusType.interface";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "bonus_type",
  indexes: [],
  hooks: {
		beforeCreate: (document: BonusType) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: BonusType) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class BonusType extends Model<BonusTypeAttributes>
  implements BonusTypeAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    allowNull: false,
    unique: false,
    type: DataTypes.STRING,
  })
  code: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  name: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  timesheetName: string;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  basePrice: number;

  @Column({
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  })
  isActive: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  dailyCost: number;

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
