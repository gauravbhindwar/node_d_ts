import { AccountAttributes } from '@/interfaces/model/account.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import Timesheet from './timesheet.model';
import User from './user.model';
@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'account',
	indexes: [],
	hooks: {
		beforeCreate: (document: Account) => {
			const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: Account) => {
			const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.updatedatutc = utcDate;
		},
		beforeDestroy: (document: Account) => {
			const utcDate = new Date().toISOString(); // UTC in ISO format
			document.deletedatutc = utcDate;
		  },
	  },
})
export default class Account extends Model<AccountAttributes> implements AccountAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	timesheetId?: number;

	@BelongsTo(() => Timesheet, {
		foreignKey: 'timesheetId',
		constraints: false,
		as: 'Timesheet',
	})
	timesheet?: Timesheet;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	employeeId?: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	n: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	position: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	type: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	affectation: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	serviceMonth: string;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	monthlySalaryWithHousingAndTravel: number;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	daysWorked: number;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	dailyCost: number;

	@Column({
		type: DataTypes.FLOAT,
		allowNull: false,
	})
	shouldBeInvoiced: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	invoiced: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	toBeInvoicedBack: number;

	@Column({
		type: DataTypes.STRING,
	})
	poNumber: string;

	@Column({
		type: DataTypes.DATE,
	})
	poDate: Date;

	@Column({
		type: DataTypes.STRING,
	})
	invoiceNumber: string;

	@Column({
		type: DataTypes.DATE,
	})
	invoiceLodgingDate: Date;

	@Column({
		type: DataTypes.FLOAT,
	})
	invoiceAmount: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	salaryPaid: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	bonus1Name: string;

	@Column({
		type: DataTypes.FLOAT,
	})
	bonus1: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	poBonus1: number;

	@Column({
		type: DataTypes.STRING,
	})
	invoiceNumberPOBonus1: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	bonus2Name: string;

	@Column({
		type: DataTypes.FLOAT,
	})
	bonus2: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	poBonus2: number;

	@Column({
		type: DataTypes.STRING,
	})
	invoiceNumberPOBonus2: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	bonus3Name: string;

	@Column({
		type: DataTypes.FLOAT,
	})
	bonus3: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	poBonus3: number;

	@Column({
		type: DataTypes.STRING,
	})
	invoiceNumberPOBonus3: string;

	@Column({
		type: DataTypes.FLOAT,
	})
	additionalAmount: number;

	@Column({
		type: DataTypes.STRING,
	})
	additionalPOBonus: string;

	@Column({
		type: DataTypes.STRING,
	})
	additionalInvoiceNumberPO: string;

	@Column({
		type: DataTypes.DATE,
	})
	dateSalaryPaid: Date;

	@Column({
		type: DataTypes.STRING,
	})
	comments: string;

	@Column({
		type: DataTypes.STRING,
	})
	additionalBonusNames: string;

	@Column({
		type: DataTypes.STRING,
	})
	poNumberBonus1?: string;

	@Column({
		type: DataTypes.STRING,
	})
	poNumberBonus2: string;

	@Column({
		type: DataTypes.STRING,
	})
	poNumberBonus3: string;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isGeneratedInvoice: boolean;

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
}
