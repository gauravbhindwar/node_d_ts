import { DataTypes } from 'sequelize';

import {
	MedicalRequestAttributes,
	RequiredMedicalRequestAttributes,
	medicalRequestStatus,
} from '@/interfaces/model/medicalRequest.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import MedicalType from './medicalType.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'medical_request',
	indexes: [
		{
			fields: ['reference'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
	hooks: {
		beforeCreate: (document: MedicalRequest) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: MedicalRequest) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class MedicalRequest
	extends Model<MedicalRequestAttributes, RequiredMedicalRequestAttributes>
	implements MedicalRequestAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	})
	reference: string;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@ForeignKey(() => MedicalType)
	@Column
	medicalTypeId: number;

	@BelongsTo(() => MedicalType, {
		foreignKey: 'medicalTypeId',
		constraints: false,
		as: 'medicalTypeData',
	})
	medicalTypeData?: MedicalType;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	medicalDate: Date;

	@Column({
		type: DataTypes.DATE,
	})
	medicalExpiry: Date;

	@Column
	utcmedicalDate:string;

	@Column({
		type: DataTypes.ENUM(...Object.values(medicalRequestStatus)),
		defaultValue: medicalRequestStatus.ACTIVE,
	})
	status: medicalRequestStatus;

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

	@BelongsTo(() => User, {
		foreignKey: 'updatedBy',
		constraints: false,
		as: 'updatedByUser',
	})
	updatedByUser?: User;

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
