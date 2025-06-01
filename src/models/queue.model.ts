import { QueueAttributes, queueStatus } from '@/interfaces/model/queue.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'queue',
	indexes: [],
	hooks: {
		beforeCreate: (document: Queue) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: Queue) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class Queue extends Model<QueueAttributes> implements QueueAttributes {
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
	processName: string;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@ForeignKey(() => Employee)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: true,
	})
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	clientEndDate: Date;

	@Column({
		type: DataTypes.DATE,
		allowNull: true,
	})
	startDate: Date;

	@Column({
		type: DataTypes.DATE,
		allowNull: true,
	})
	endDate: Date;

	@Column({
		type: DataTypes.TEXT,
		allowNull: true,
	})
	error: string;

	@Column({
		type: DataTypes.ENUM(...Object.values(queueStatus)),
		defaultValue: queueStatus.PENDING,
	})
	status: queueStatus;

	@Column({
		type: DataTypes.INTEGER,
		defaultValue: 0,
	})
	totalTakes: number;

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

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
