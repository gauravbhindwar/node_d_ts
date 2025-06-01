import { EmployeeRotationAttributes } from '@/interfaces/model/employeeRotation.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import Rotation from './rotation.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_rotation',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeRotation) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeRotation) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeRotation extends Model<EmployeeRotationAttributes> implements EmployeeRotationAttributes {
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

	@ForeignKey(() => Rotation)
	@Column({
		allowNull: true,
	})
	rotationId: number;

	@BelongsTo(() => Rotation, {
		foreignKey: 'rotationId',
		constraints: false,
		as: 'rotation',
	})
	rotation?: Rotation;

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
