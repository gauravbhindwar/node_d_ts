import { TransportRequestAttributes, transportStatus } from '@/interfaces/model/transport.request.interface';
import { DataTypes } from 'sequelize';
import {
	BelongsTo,
	Column,
	CreatedAt,
	DeletedAt,
	ForeignKey,
	HasMany,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import Client from './client.model';
import TransportRequestVehicle from './transport.request.vehicle.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_request',
	indexes: [],
	hooks: {
		beforeCreate: (document: TransportRequest) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: TransportRequest) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class TransportRequest extends Model<TransportRequestAttributes> implements TransportRequestAttributes {
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
	source: string;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	startDate: Date;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	destination: string;


	@Column({
		type: DataTypes.STRING,
	})
	utcstartDate: string;


	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	utcdestinationDate: string;

	@Column({
		type: DataTypes.DATE,
		allowNull: false,
	})
	destinationDate: Date;

	@Column({
		type: DataTypes.ENUM(...Object.values(transportStatus)),
		defaultValue: transportStatus.DRAFT,
	})
	status: transportStatus;

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

	@HasMany(() => TransportRequestVehicle)
	transportRequestVehicle?: TransportRequestVehicle[];
}
