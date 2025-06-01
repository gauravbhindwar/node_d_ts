import { TransportVehicleDocumentAttributes } from '@/interfaces/model/transport.vehicle.document.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Folder from './folder.model';
import TransportVehicle from './transport.vehicle.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'transport_vehicle_documents',
	indexes: [],
	hooks: {
		beforeCreate: (document: TransportVehicleDocument) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: TransportVehicleDocument) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class TransportVehicleDocument
	extends Model<TransportVehicleDocumentAttributes>
	implements TransportVehicleDocumentAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

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

	@ForeignKey(() => Folder)
	@Column
	folderId: number;

	@BelongsTo(() => Folder, {
		foreignKey: 'folderId',
		constraints: false,
		as: 'folder',
	})
	folder?: Folder;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	documentName: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	documentPath: string;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	documentSize: number;

	@Column
	issueDate: Date;

	@Column
	expiryDate: Date;

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
