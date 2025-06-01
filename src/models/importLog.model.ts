import { ImportLogAttributes, RequiredImportLogAttributes } from '@/interfaces/model/importLog.interface';
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
import Client from './client.model';
import ImportLogItems from './importLogItem.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: false,
	tableName: 'import_logs',
	indexes: [],
	hooks: {
		beforeCreate: (document: ImportLog) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ImportLog) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ImportLog
	extends Model<ImportLogAttributes, RequiredImportLogAttributes>
	implements ImportLogAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	fileName: string;

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
	startDate: Date;

	@Column
	endDate: Date;

	@Column
	rowNo: number;

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

	@HasMany(() => ImportLogItems)
	importLogData?: ImportLogItems[];
}
