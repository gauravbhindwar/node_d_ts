import { DataTypes } from 'sequelize';

import { NotificationAttributes, RequiredNotificationAttributes } from '@/interfaces/model/notification.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'notifications',
})
export default class Notification
	extends Model<NotificationAttributes, RequiredNotificationAttributes>
	implements NotificationAttributes
{
	boolean: any;
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column
	title?: string;

	
	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	message?: string;

	@Column
	isRead?: boolean;

	@Column
	@ForeignKey(() => User)
	userId: number;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@BelongsTo(() => User, {
		foreignKey: 'userId',
		constraints: false,
		as: 'addedByUser',
	})
	addedByUser: User;
	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
