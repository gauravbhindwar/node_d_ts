import {
  MessageAttributes,
  RequiredMessageAttributes,
  messageStatus,
} from "@/interfaces/model/message.interface";
import { DataTypes } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Client from "./client.model";
import MessageDetail from "./messageDetail.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "message",
  indexes: [],
  hooks: {
    beforeCreate: (document: Message) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: Message) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: Message) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.deletedatutc = utcDate;
    },
  },
})
export default class Message
  extends Model<MessageAttributes, RequiredMessageAttributes>
  implements MessageAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

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
    type: DataTypes.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  errorMessage: string;

  @Column({
    type: DataTypes.ENUM(...Object.values(messageStatus)),
    defaultValue: messageStatus.DRAFT,
  })
  status: messageStatus;

  @Column({
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  isSchedule: boolean;

  @Column
  scheduleDate: Date;

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

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };

  @HasMany(() => MessageDetail)
  messageDetail?: MessageDetail[];
}
