import { MessageDetailAttributes, RequiredMessageDetailAttributes } from '@/interfaces/model/messageDetail.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, DeletedAt, ForeignKey, Model, Table } from 'sequelize-typescript';
import Employee from './employee.model';
import Message from './message.model';
import Segment from './segment.model';
import User from './user.model';

@Table({
	timestamps: false,
	paranoid: true,
	tableName: 'message_detail',
	indexes: [],
	hooks: {
		beforeCreate: (document: MessageDetail) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: MessageDetail) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class MessageDetail
	extends Model<MessageDetailAttributes, RequiredMessageDetailAttributes>
	implements MessageDetailAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Message)
	@Column
	messageId: number;

	@BelongsTo(() => Message, {
		foreignKey: 'messageId',
		constraints: false,
		as: 'message',
	})
	message?: Message;

	@ForeignKey(() => User)
	@Column
	managerUserId: number;

	@BelongsTo(() => User, {
		foreignKey: 'managerUserId',
		constraints: false,
		as: 'managerUser',
	})
	managerUser?: User;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employeeDetail',
	})
	employeeDetail?: Employee;

	@ForeignKey(() => Segment)
	@Column
	segmentId: number;

	@BelongsTo(() => Segment, {
		foreignKey: 'segmentId',
		constraints: false,
		as: 'segmentDetail',
	})
	segmentDetail?: Segment;

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
