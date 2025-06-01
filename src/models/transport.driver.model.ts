import {
	RequiredTransportDriverAttributes,
	TransportDriverAttributes,
} from '@/interfaces/model/transport.driver.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import TransportPositions from './transport.positions.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_driver',
	indexes: [
		{
			fields: ['driverNo'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
	hooks: {
		beforeCreate: (document: TransportDriver) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: TransportDriver) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class TransportDriver
	extends Model<TransportDriverAttributes, RequiredTransportDriverAttributes>
	implements TransportDriverAttributes
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
		allowNull: false,
	})
	driverNo: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	firstName: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	lastName: string;

	@Column({
		type: DataTypes.STRING,
	})
	unavailableDates: string;

	@ForeignKey(() => TransportPositions)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	positionId: number;

	@BelongsTo(() => TransportPositions, {
		foreignKey: 'positionId',
		constraints: false,
		as: 'position',
	})
	position?: TransportPositions;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	companyStart: Date;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	experienceStart: Date;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

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
	utcexperienceStart: string;

	@Column({
		type: DataTypes.STRING,
	})
	utccompanyStart: string;

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
