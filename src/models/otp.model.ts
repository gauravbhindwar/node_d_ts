import { DataTypes } from 'sequelize';

import {
	Column,
	CreatedAt,
	DeletedAt,
	Model,
	Table,
	UpdatedAt
} from 'sequelize-typescript';
import { OtpAttributes, RequiredOtpAttributes, type } from '../interfaces/model/otp.model.interface';
  
  @Table({
	timestamps: true,
	paranoid: true,
	tableName: 'otp',
  })
  export default class OTP extends Model<OtpAttributes, RequiredOtpAttributes> implements OtpAttributes {
	@Column({
	  primaryKey: true,
	  autoIncrement: true,
	  allowNull: false,
	  type: DataTypes.INTEGER,
	})
	id: number;
	
	@Column({
		type: DataTypes.INTEGER,
	})
	otp?: number;
	
	@Column({
		type: DataTypes.STRING,
		defaultValue:type.REGISTER
	})
	type?: type;

	@Column({
		type: DataTypes.STRING,
	})
	expired?: Date;
	
	@Column({
		type: DataTypes.STRING,
	})
	email?: string;
	
	@CreatedAt
	createdAt: Date;
  
	@UpdatedAt
	updatedAt: Date;
  
	@DeletedAt
	deletedAt: Date;	
  }
  