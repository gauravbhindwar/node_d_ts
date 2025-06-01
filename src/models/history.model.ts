import {
  HistoryAttributes,
  statusEnum,
} from "@/interfaces/model/history.interface";
import { DataTypes } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: false,
  tableName: "history",
  indexes: [],
  hooks: {
    beforeCreate: (document: History) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: History) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: History) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
  },
})
export default class History extends Model<HistoryAttributes>
  implements HistoryAttributes {
  status: boolean;
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  tableName: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  moduleName: string;

  @Column({
    type: DataTypes.JSONB,
    allowNull: false,
  })
  jsonData: JSON;

  // @Column({
  //   type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
  //   allowNull: false,
  //   defaultValue: "CREATE",
  // })
  // status: statusEnum;

  @Column({
    type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
    allowNull: false,
    defaultValue: "CREATE",
  })
  activity: statusEnum;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User, {
    foreignKey: "userId",
    constraints: false,
    as: "userData",
  })
  userData?: User;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  custom_message: string;

  @Column
  updatedatutc: string;

  @Column
  createdatutc: string;

  @Column
  deletedatutc: string;

  @Column
  lastlogintime: string;

  @Column
  lastlogouttime: string;

  @Column
  systemUtilisationTime: string;
}
