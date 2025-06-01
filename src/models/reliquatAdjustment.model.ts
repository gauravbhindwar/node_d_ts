import { DataTypes } from 'sequelize';

import { ReliquatAdjustmentAttributes } from '@/interfaces/model/reliquatAdjustment.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'reliquat_adjustment',
	indexes: [],
	hooks: {
		beforeCreate: (document: ReliquatAdjustment) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ReliquatAdjustment) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ReliquatAdjustment
	extends Model<ReliquatAdjustmentAttributes>
	implements ReliquatAdjustmentAttributes
{
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
		foreignKey: 'clientId',
		constraints: false,
		as: 'clientData',
	})
	clientData?: Client;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employeeData',
	})
	employeeData?: Employee;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	startDate: Date;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	adjustment: number;

	@CreatedAt
	createdAt: Date;

	@ForeignKey(() => User)
	@Column
	createdBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'createdBy',
		constraints: false,
		as: 'createdByUser',
	})
	createdByUser?: User;

	@UpdatedAt
	updatedAt: Date;

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'updatedBy',
		constraints: false,
		as: 'updatedByUser',
	})
	updatedByUser?: User;
    
	@Column
	utcstartDate:string

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
