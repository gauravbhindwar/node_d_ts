import { segmentUserAttributes } from "@/interfaces/model/segment.interface";
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
import LoginUser from "./loginUser.model";
import Segment from "./segment.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "segment_manager",
  indexes: [],
  hooks: {
    beforeCreate: (document: SegmentManager) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: SegmentManager) => {
      const utcDate = new Date().toISOString(); // Update updatedAt with UTC
      document.updatedatutc = utcDate;
    },
  },
})
export default class SegmentManager extends Model<segmentUserAttributes>
  implements segmentUserAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => LoginUser)
  @Column
  loginUserId: number;

  @BelongsTo(() => LoginUser, {
    foreignKey: "loginUserId",
    constraints: false,
    as: "loginUserData",
  })
  loginUserData?: LoginUser;

  @ForeignKey(() => Segment)
  @Column
  segmentId: number;

  @BelongsTo(() => Segment, {
    foreignKey: "segmentId",
    constraints: false,
    as: "segment",
  })
  segment?: Segment;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "clientData",
  })
  client?: Client;

  @Column({
    defaultValue: true,
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
