import { DataTypes } from "sequelize";
import { LeaveTypeMasterAttributes, payment_type } from "@/interfaces/model/leaveTypeMaster.interface";
import {
  Column,
  Model,
  Table,HasMany
} from "sequelize-typescript";
  
  @Table({
    timestamps: true,
    paranoid: true,
    tableName: "leave_type_master",
    indexes: [],
    hooks: {
      beforeCreate: (document: LeaveTypeMaster) => {
        const utcDate = new Date().toISOString();
        document.createdatutc = utcDate;
        document.updatedatutc = utcDate;
      },
      beforeUpdate: (document: LeaveTypeMaster) => {
        const utcDate = new Date().toISOString();
        document.updatedatutc = utcDate;
      },
      beforeDestroy: (document: LeaveTypeMaster) => {
        const utcDate = new Date().toISOString();
        document.updatedatutc = utcDate;
      },
    },
  })
  export default class LeaveTypeMaster extends Model<LeaveTypeMasterAttributes>
    implements LeaveTypeMasterAttributes {
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
    type: DataTypes.ENUM(...Object.values(payment_type)),
    defaultValue: payment_type.UNPAID,
    })
    payment_type: payment_type;

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
  