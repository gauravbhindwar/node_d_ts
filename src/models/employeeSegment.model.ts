import { EmployeeSegmentAttributes } from '@/interfaces/model/employeeSegment.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import Segment from './segment.model';
import SubSegment from './subSegment.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_segment',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeSegment) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeSegment) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeSegment extends Model<EmployeeSegmentAttributes> implements EmployeeSegmentAttributes {
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

	@ForeignKey(() => Segment)
	@Column({
		allowNull: true,
	})
	segmentId: number;

	@BelongsTo(() => Segment, {
		foreignKey: 'segmentId',
		constraints: false,
		as: 'segment',
	})
	segment?: Segment;

	@ForeignKey(() => SubSegment)
	@Column({
		allowNull: true,
	})
	subSegmentId: number;

	@BelongsTo(() => SubSegment, {
		foreignKey: 'subSegmentId',
		constraints: false,
		as: 'subSegment',
	})
	subSegment?: SubSegment;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
	date: Date;

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
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	rollover: boolean;

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
