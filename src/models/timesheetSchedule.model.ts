import { TimesheetScheduleAttributes } from '@/interfaces/model/timesheetSchedule.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'timesheet_schedule',
	indexes: [
		{
			fields: ['dbKey'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class TimesheetSchedule
	extends Model<TimesheetScheduleAttributes>
	implements TimesheetScheduleAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

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
		type: DataTypes.DATE,
	})
	date: Date;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	status: string;

	@Column({
		allowNull: true,
		type: DataTypes.INTEGER,
	})
	statusId: number;

	@Column({
		allowNull: true,
		type: DataTypes.INTEGER,
	})
	overtimeHours: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	bonusCode: string;

	@Column({
		allowNull: false,
		unique: true,
		type: DataTypes.STRING,
	})
	dbKey: string;

	@Column({
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	})
	isLeaveForTitreDeConge: boolean;

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
