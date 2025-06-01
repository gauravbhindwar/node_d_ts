import { DataTypes } from 'sequelize';
import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { RequiredRoleAttributes, RoleAttributes } from '@/interfaces/model/role.interface';
import RolePermission from './rolePermission.model';
import User from './user.model';
const utcDate = new Date().toISOString(); // UTC in ISO format

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'role',
	indexes: [
		{
			fields: ['name'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
	hooks: {
		beforeCreate: (document: Role) => {
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: Role) => {
		  document.updatedatutc = utcDate;
		},
		beforeDestroy:  (document: Role) => {
		  document.deletedatutc = utcDate;
		},
	  },
})
export default class Role extends Model<RoleAttributes, RequiredRoleAttributes> implements RoleAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		allowNull: false,
		unique: true,
		type: DataTypes.STRING,
	})
	name: string;

	@Column({
		type: DataTypes.BOOLEAN,
		allowNull: true,
		defaultValue: false,
	})
	isViewAll: boolean;

	@Column
	slug_name: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@HasMany(() => RolePermission)
	assignedPermissions?: RolePermission[];

	@HasMany(() => User)
	users?: User[];

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;
}
