import { RequestDocumentAttributes, requestStatus } from '@/interfaces/model/request.document.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Request from './request.model';
import RequestType from './requestType.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'request_document',
	indexes: [],
	hooks: {
		beforeCreate: (document: RequestDocument) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: RequestDocument) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class RequestDocument extends Model<RequestDocumentAttributes> implements RequestDocumentAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => RequestType)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	documentType: number;

	@BelongsTo(() => RequestType, {
		foreignKey: 'documentType',
		constraints: false,
		as: 'documentTypeData',
	})
	documentTypeData?: RequestType;

	@Column({
		type: DataTypes.TEXT,
		allowNull: false,
	})
	otherInfo?: string;

	@ForeignKey(() => User)
	@Column
	completedBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'completedBy',
		constraints: false,
		as: 'completedByUser',
	})
	completedByUser?: User;

	@Column({
		type: DataTypes.ENUM(...Object.values(requestStatus)),
		allowNull: true,
	})
	status: requestStatus;

	@ForeignKey(() => Request)
	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	requestId: number;

	@BelongsTo(() => Request, {
		foreignKey: 'requestId',
		constraints: false,
		as: 'request',
	})
	request?: Request;

	@Column({
		type: DataTypes.DATE,
	})
	completedDate: Date;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
