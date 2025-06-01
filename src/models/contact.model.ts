import { DataTypes } from "sequelize";

import {
  ContactAttributes,
  RequiredContactAttributes,
} from "@/interfaces/model/contact.interface";
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
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "contact",
  indexes: [
    {
      fields: ["email"],
      unique: true,
      where: {
        deletedAt: null,
      },
    },
  ],
  hooks: {
    beforeCreate: (document: Contact) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format
      document.createdatutc = utcDate;
      document.updatedatutc = utcDate;
    },
    beforeUpdate: (document: Contact) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format

      document.updatedatutc = utcDate;
    },
    beforeDestroy: (document: Contact) => {
      const utcDate = new Date().toISOString(); // UTC in ISO format

      document.deletedatutc = utcDate;
    },
  },
})
export default class Contact
  extends Model<ContactAttributes, RequiredContactAttributes>
  implements ContactAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    type: DataTypes.STRING,
  })
  slug: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataTypes.STRING,
  })
  email: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  address1: string;

  @Column
  address2: string;

  @Column
  address3: string;

  @Column
  address4: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  city: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  region: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  postalCode: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  country: string;

  @Column
  dueDateDays: number;

  @Column
  brandingTheme: string;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

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
