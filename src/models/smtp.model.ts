import { DataTypes } from 'sequelize';

import { RequiredSmtpAttributes, SmtpAttributes } from 'interfaces/model/smtp.interface';
import {
	Column,
	CreatedAt,
	DeletedAt,
	Model,
	Table,
	UpdatedAt
} from 'sequelize-typescript';
  
  @Table({
	timestamps: true,
	paranoid: true,
	tableName: 'smtp',
  })
  export default class Smtp extends Model<SmtpAttributes, RequiredSmtpAttributes> implements SmtpAttributes {
	@Column({
	  primaryKey: true,
	  autoIncrement: true,
	  allowNull: false,
	  type: DataTypes.INTEGER,
	})
	id: number;
	
	@Column({ type: DataTypes.INTEGER, allowNull: false })
	port?: number;
	

	@Column({
		type: DataTypes.STRING,
	})
	host?: string;
	
	@Column({
		type: DataTypes.STRING,
	})
	username?: string;

	@Column({
		type: DataTypes.STRING,
	})
	
	password?: string;

	@Column({ 
		type: DataTypes.BOOLEAN, defaultValue: true 
    })
	secure?: boolean;
	
	
	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: true 
	})
	isDefault?: boolean;
	
	@CreatedAt
	createdAt: Date;
  
	@UpdatedAt
	updatedAt: Date;
  
	@DeletedAt
	deletedAt: Date;	
  }
  