import {
	ReliquatCalculationAttributes,
	RequiredReliquatCalculationAttributes,
} from '@/interfaces/model/reliquatCalculation.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import Timesheet from './timesheet.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'reliquat_calculation',
	indexes: [],
	hooks: {
		beforeCreate: (document: ReliquatCalculation) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ReliquatCalculation) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ReliquatCalculation
	extends Model<ReliquatCalculationAttributes, RequiredReliquatCalculationAttributes>
	implements ReliquatCalculationAttributes
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
		as: 'client',
	})
	client?: Client;

	@ForeignKey(() => Timesheet)
	@Column
	timesheetId: number;

	@BelongsTo(() => Timesheet, {
		foreignKey: 'timesheetId',
		constraints: false,
		as: 'timesheet',
	})
	timesheet?: Timesheet;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	leave: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	presentDay: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	annualLeave: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	absenseDay: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	totalTakenLeave: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	earned: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	monthly_earned: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	monthly_reliquat: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	monthly_calc_equation: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	monthly_calc_formula: string;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	totalWorked: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	weekend: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	weekendBonus: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	overtime: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	overtimeBonus: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquat: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatValue: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatPaymentValue: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatPayment: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatAdjustmentValue: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatAdjustment: number;

	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	calculateEquation: string;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	calculation: number;

	@Column
	startDate: Date;

	@Column
	endDate: Date;

	@Column
	utcstartDate: string;

	@Column
	utcendDate: string;

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

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

	@Column({
		type: DataTypes.TEXT,
	})
	calculationDataJSON: string;

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
