import { EmployeeBonusAttributes } from '@/interfaces/model/employeeBonus.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import BonusType from './bonusType.model';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_bonus',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeBonus) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeBonus) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeBonus extends Model<EmployeeBonusAttributes> implements EmployeeBonusAttributes {
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

	@ForeignKey(() => BonusType)
	@Column
	bonusId: number;

	@BelongsTo(() => BonusType, {
		foreignKey: 'bonusId',
		constraints: false,
		as: 'bonus',
	})
	bonus?: BonusType;

	@Column({
		allowNull: false,
		type: DataTypes.FLOAT,
	})
	price: number;

	@Column({
		allowNull: false,
		type: DataTypes.FLOAT,
	})
	coutJournalier: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	catalogueNumber: string;

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
