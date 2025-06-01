import { EmployeeCatalogueNumberAttributes } from '@/interfaces/model/employeeCatalogueNumber.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import Employee from './employee.model';
@Table({
	timestamps: false,
	paranoid: false,
	tableName: 'employee_catalogue_number',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeCatalogueNumber) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeCatalogueNumber) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeCatalogueNumber
	extends Model<EmployeeCatalogueNumberAttributes>
	implements EmployeeCatalogueNumberAttributes
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
	startDate: Date;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	catalogueNumber: string;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
