import { DataTypes } from 'sequelize';

import { RolePermissionAttributes } from '@/interfaces/model/rolePermission.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Permission from './permission.model';
import Role from './role.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'role_permission',
	indexes: [],
	hooks: {
		beforeCreate: (document: RolePermission) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: RolePermission) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Permission)
	@Column
	permissionId: number;

	@BelongsTo(() => Permission, {
		foreignKey: 'permissionId',
		constraints: false,
		as: 'permission',
	})
	permission?: Permission;

	@ForeignKey(() => Role)
	@Column
	roleId: number;

	@BelongsTo(() => Role, {
		foreignKey: 'roleId',
		constraints: false,
		as: 'role',
	})
	role?: Role;

	@CreatedAt
	createdAt: Date;

	@ForeignKey(() => User)
	@Column
	createdBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'createdBy',
		as: 'createdByUser',
	})
	createdByUser?: User;

	@UpdatedAt
	updatedAt: Date;

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'updatedBy',
		as: 'updatedByUser',
	})
	updatedByUser?: User;

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
