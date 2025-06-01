import {
	RequiredTransportCommonAttributes,
	TransportCommonAttributes,
} from '@/interfaces/model/transport.common.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_positions',
	indexes: [
		{
			fields: ['name'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class TransportPositions
	extends Model<TransportCommonAttributes, RequiredTransportCommonAttributes>
	implements TransportCommonAttributes
{
	type: string;
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
	name: string;

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
