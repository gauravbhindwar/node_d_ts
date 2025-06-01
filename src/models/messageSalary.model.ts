import { MessageSalaryAttributes, RequiredMessageSalaryAttributes } from '@/interfaces/model/messageSalary.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'message_salary',
	indexes: [],
	hooks: {
		beforeCreate: (document: MessageSalary) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: MessageSalary) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class MessageSalary
	extends Model<MessageSalaryAttributes, RequiredMessageSalaryAttributes>
	implements MessageSalaryAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Client)
	@Column({
		allowNull: true,
	})
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@ForeignKey(() => User)
	@Column
	managerUserId: number;

	@BelongsTo(() => User, {
		foreignKey: 'managerUserId',
		constraints: false,
		as: 'managerUser',
	})
	managerUser?: User;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employeeDetail',
	})
	employeeDetail?: Employee;

	@Column
	salaryDate: Date;

	@Column
	phone: string;

	@Column({
		type: DataTypes.STRING,
	})
	email: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	salaryMonth: string;

	@Column
	message: string;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: true,
	})
	bonusPrice: number;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	monthlySalary: number;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	total: number;

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

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
