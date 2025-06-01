import { UserBankDetailsAttibutes } from "@/interfaces/model/bankDetails.interface";
import { DataTypes } from "sequelize";
import {
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import LoginUser from "./loginUser.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "banks",
  indexes: [],
  hooks: {
    beforeCreate: (document: UserBankDetailsModel) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: UserBankDetailsModel) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy:  (document: UserBankDetailsModel) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class UserBankDetailsModel
  extends Model<UserBankDetailsAttibutes>
  implements UserBankDetailsAttibutes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => LoginUser)
  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  loginUserId: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  bankName: string;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  ribNumber: number;

  @Column({
    type: DataTypes.BOOLEAN,
  })
  isActive: boolean;

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
