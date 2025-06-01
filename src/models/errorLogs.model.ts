import { ErrorLogsAttributes, RequiredErrorLogsAttributes } from '@/interfaces/model/errorLogs.interface';
import { messageStatus } from '@/interfaces/model/message.interface';
import { status } from '@/interfaces/model/user.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: false,
	tableName: 'error_logs',
	indexes: [],
	hooks: {
		beforeCreate: (document: ErrorLogs) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ErrorLogs) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ErrorLogs
	extends Model<ErrorLogsAttributes, RequiredErrorLogsAttributes>
	implements ErrorLogsAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@Column
	type: string;

	@Column
	error_message: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	full_error: string;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	email: string;

	@Column({
		type: DataTypes.ENUM(...Object.values(messageStatus)),
		defaultValue: messageStatus.ERROR,
	})
	status: messageStatus;

	@Column({
		type: DataTypes.ENUM(...Object.values(status)),
		defaultValue: status.ACTIVE,
	})
	isActive: status;

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

	@DeletedAt
	deletedAt: Date;
    
	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
