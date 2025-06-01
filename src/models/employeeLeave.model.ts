import { EmployeeLeaveAttributes, employeeLeaveStatus } from '@/interfaces/model/employeeLeave.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import Rotation from './rotation.model';
import Segment from './segment.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_leave',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeLeave) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeLeave) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeLeave extends Model<EmployeeLeaveAttributes> implements EmployeeLeaveAttributes {
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
		as: 'employeeDetail',
	})
	employeeDetail?: Employee;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	reference: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	leaveType: string;

	@Column
	startDate: Date;

	@Column
	endDate: Date;

	@Column({
		type: DataTypes.ENUM(...Object.values(employeeLeaveStatus)),
		defaultValue: employeeLeaveStatus.ACTIVE,
	})
	status: employeeLeaveStatus;

	@ForeignKey(() => Segment)
	@Column
	segmentId: number;

	@BelongsTo(() => Segment, {
		foreignKey: 'segmentId',
		constraints: false,
		as: 'segmentDetail',
	})
	segmentDetail?: Segment;

	@ForeignKey(() => Rotation)
	@Column
	rotationId: number;

	@BelongsTo(() => Rotation, {
		foreignKey: 'rotationId',
		constraints: false,
		as: 'rotationDetail',
	})
	rotationDetail?: Rotation;

	@Column({
		type: DataTypes.DATE,
	})
	employeeContractEndDate?: Date;

	@Column({
		type: DataTypes.INTEGER,
	})
	totalDays?: number;

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

	@Column({
		type: DataTypes.STRING,
	})
	utcstartDate?: string;

	@Column({
		type: DataTypes.STRING,
	})
	utcendDate?: string;

	@UpdatedAt
	updatedAt: Date;

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

	@BelongsTo(() => User, {
		foreignKey: 'updatedBy',
		constraints: false,
		as: 'updatedByUser',
	})
	updatedByUser?: User;

	@DeletedAt
	deletedAt: Date;

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
