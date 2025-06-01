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

import { status, UserAttributes } from '../interfaces/model/user.interface';
import LoginUser from './loginUser.model';
import Role from './role.model';
import UserClient from './userClient.model';
import UserPermission from './userPermission.model';
import UserSegment from './userSegment.model';
import UserSegmentApproval from './userSegmentApproval.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'users',
	indexes: [],
	hooks: {
		beforeCreate: (document: User) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: User) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class User extends Model<UserAttributes> implements UserAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => LoginUser)
	@Column({
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	loginUserId: number;

	@BelongsTo(() => LoginUser, {
		foreignKey: 'loginUserId',
		constraints: false,
		as: 'loginUserData',
	})
	loginUserData?: LoginUser;

	@ForeignKey(() => Role)
	@Column
	roleId: number;

	@BelongsTo(() => Role, {
		foreignKey: 'roleId',
		constraints: false,
		as: 'roleData',
	})
	roleData?: Role;

	@Column({
		type: DataTypes.ENUM(...Object.values(status)),
		defaultValue: status.ACTIVE,
	})
	status: status;

	@Column({
		type: DataTypes.STRING,
	})
	hashToken?: string;

	@Column({
		type: DataTypes.DATE,
	})
	hashTokenExpiry: Date;

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

	@HasMany(() => UserClient)
	userClientList?: UserClient[];

	@HasMany(() => UserSegment)
	userSegmentList?: UserSegment[];

	@HasMany(() => UserSegmentApproval)
	userSegmentApprovalList?: UserSegmentApproval[];

	@HasMany(() => UserPermission)
	userPermission?: UserPermission[];
}
