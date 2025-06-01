import { ReliquatCalculationV2Attributes } from '@/interfaces/model/reliquatCalculationV2.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import Timesheet from './timesheet.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: false,
	tableName: 'reliquat_calculation_v2',
	indexes: [],
	hooks: {
		beforeCreate: (document: ReliquatCalculationV2) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ReliquatCalculationV2) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ReliquatCalculationV2
	extends Model<ReliquatCalculationV2Attributes>
	implements ReliquatCalculationV2Attributes
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

	@Column({
		type: DataTypes.STRING,
	})
	rotationName: string;

	@Column({
		type: DataTypes.STRING,
	})
	segmentName: string;

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
	taken: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	presentDay: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	earned: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	earnedTaken: number;

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
	overtime: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	adjustment: number;

	@Column({
		allowNull: true,
		type: DataTypes.FLOAT,
	})
	reliquatPayment: number;

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

	@Column
	startDate: Date;

	@Column
	endDate: Date;

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

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
