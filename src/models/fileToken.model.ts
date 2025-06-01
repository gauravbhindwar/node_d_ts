import { FileTokenAttributes, RequiredFileTokenAttributes } from '@/interfaces/model/fileToken.interface';
import { DataTypes } from 'sequelize';

import { Column, Model, Table } from 'sequelize-typescript';

@Table({
	timestamps: false,
	paranoid: false,
	tableName: 'file_token',
})
export default class FileToken
	extends Model<FileTokenAttributes, RequiredFileTokenAttributes>
	implements FileTokenAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	token: string;
}
