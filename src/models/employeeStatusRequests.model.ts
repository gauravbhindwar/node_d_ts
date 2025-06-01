import { actionType, EmployeeStatusRequestAttributes, status } from '@/interfaces/model/employeeStatusRequests.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DataType, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import Employee from './employee.model';
import Role from './role.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_status_requests',
	indexes: [],
	hooks: {
		beforeCreate: (document: EmployeeStatusRequest) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
          document.requestDate = utcDate;
		},
		beforeUpdate: (document: EmployeeStatusRequest) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeStatusRequest extends Model<EmployeeStatusRequestAttributes> implements EmployeeStatusRequestAttributes {
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
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  requestBy: string;

  @Column
  requestDate: string;

  @ForeignKey(() => Role)
	@Column
  roleId: number;

  @BelongsTo(() => Role, {
		foreignKey: 'roleId',
		constraints: false,
		as: 'userRole',
	})
  userRole: Role;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  reason: string;

  @Column({
    type: DataTypes.ENUM(...Object.values(actionType)),
    allowNull: false,
  })
  requestType: actionType;

  @Column({
    type: DataTypes.ENUM(...Object.values(status)),
    defaultValue: status.PENDING,
  })
  status: status;

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

	@DeletedAt
	deletedAt: Date;

	@Column
	updatedatutc: string;

	@Column
	createdatutc: string;

	@Column
	deletedatutc: string;
}
