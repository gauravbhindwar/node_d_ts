import {
	RequiredTransportVehicleAttributes,
	TransportVehicleAttributes,
} from '@/interfaces/model/transport.vehicle.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import TransportModels from './transport.models.model';
import TransportType from './transport.type.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_vehicle',
	indexes: [
		{
			fields: ['vehicleNo'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class TransportVehicle
	extends Model<TransportVehicleAttributes, RequiredTransportVehicleAttributes>
	implements TransportVehicleAttributes
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
	vehicleNo: string;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	year: number;

	@ForeignKey(() => TransportType)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	typeId: number;

	@BelongsTo(() => TransportType, {
		foreignKey: 'typeId',
		constraints: false,
		as: 'type',
	})
	type?: TransportType;

	@ForeignKey(() => TransportModels)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	modelId: number;

	@BelongsTo(() => TransportModels, {
		foreignKey: 'modelId',
		constraints: false,
		as: 'models',
	})
	models?: TransportModels;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	capacity: string;

	@Column({
		type: DataTypes.STRING,
	})
	unavailableDates: string;

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
}
