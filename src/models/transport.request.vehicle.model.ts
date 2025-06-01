import { TransportRequestVehicleAttributes } from '@/interfaces/model/transport.request.vehicle.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import TransportDriver from './transport.driver.model';
import TransportRequest from './transport.request.model';
import TransportVehicle from './transport.vehicle.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_request_vehicle',
	indexes: [],
	hooks: {
		beforeCreate: (document: TransportRequestVehicle) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: TransportRequestVehicle) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class TransportRequestVehicle
	extends Model<TransportRequestVehicleAttributes>
	implements TransportRequestVehicleAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => TransportRequest)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	requestId: number;

	@BelongsTo(() => TransportRequest, {
		foreignKey: 'requestId',
		constraints: false,
		as: 'request',
	})
	request?: TransportRequest;

	@ForeignKey(() => TransportDriver)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	driverId: number;

	@BelongsTo(() => TransportDriver, {
		foreignKey: 'driverId',
		constraints: false,
		as: 'driver',
	})
	driver?: TransportDriver;

	@ForeignKey(() => TransportVehicle)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	vehicleId: number;

	@BelongsTo(() => TransportVehicle, {
		foreignKey: 'vehicleId',
		constraints: false,
		as: 'vehicle',
	})
	vehicle?: TransportVehicle;

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
