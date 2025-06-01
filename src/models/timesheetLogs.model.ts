import { ITimesheetLogsAttributes, timesheetLogsStatus } from '@/interfaces/model/timesheetLogs.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Timesheet from './timesheet.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'timesheet_logs',
	indexes: [],
	hooks: {
		beforeCreate: (document: TimesheetLogs) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: TimesheetLogs) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class TimesheetLogs extends Model<ITimesheetLogsAttributes> implements ITimesheetLogsAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Timesheet)
	@Column
	timesheetId: number;

	@BelongsTo(() => Timesheet, {
		foreignKey: 'timesheetId',
		constraints: false,
		as: 'timesheet',
	})
	timesheetIdTable?: Timesheet;

	@Column({
		type: DataTypes.ENUM(...Object.values(timesheetLogsStatus)),
		defaultValue: timesheetLogsStatus.UNAPPROVED,
	})
	status: timesheetLogsStatus;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
	actionDate: Date;

	@ForeignKey(() => User)
	@Column
	actionBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'actionBy',
		constraints: false,
		as: 'actionByUser',
	})
	actionByUser?: User;

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
