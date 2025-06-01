import { EmployeeSalaryAttributes } from '@/interfaces/model/employeeSalary.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_salary',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeSalary) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeSalary) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeSalary extends Model<EmployeeSalaryAttributes> implements EmployeeSalaryAttributes {
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
		allowNull: false,
		type: DataTypes.FLOAT,
	})
	baseSalary: number;

	@Column({
		allowNull: false,
		type: DataTypes.FLOAT,
	})
	monthlySalary: number;

	@Column({
		allowNull: false,
		type: DataTypes.FLOAT,
	})
	dailyCost: number;

	@Column({
		allowNull: false,
		type: DataTypes.DATE,
	})
	startDate: Date;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
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
