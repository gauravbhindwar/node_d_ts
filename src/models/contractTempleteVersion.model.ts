import { contractTemplateVersionHook } from '@/hooks/contractTemplateVersion.hook';
import {
	ContractTemplateVersionAttributes,
	RequiredContractTemplateVersionAttributes,
} from '@/interfaces/model/contractTempleteVersion.interface';
import { DataTypes } from 'sequelize';
import {
	AfterCreate,
	BelongsTo,
	Column,
	CreatedAt,
	DeletedAt,
	ForeignKey,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import Client from './client.model';
import ContractTemplate from './contractTemplete.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'contract_template_version',
	indexes: [],
	hooks: {
		beforeCreate: (document: ContractTemplateVersion) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: ContractTemplateVersion) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class ContractTemplateVersion
	extends Model<ContractTemplateVersionAttributes, RequiredContractTemplateVersionAttributes>
	implements ContractTemplateVersionAttributes
{
	employeeId: number;
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	versionName: string;

	@Column({
		type: DataTypes.TEXT,
	})
	description: string;

	@Column
	versionNo: number;

	@ForeignKey(() => Client)
	@Column({
		allowNull: true,
		type: DataTypes.INTEGER,
	})
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@ForeignKey(() => ContractTemplate)
	@Column
	contractTemplateId: number;

	@BelongsTo(() => ContractTemplate, {
		foreignKey: 'contractTemplateId',
		constraints: false,
		as: 'contractTemplate',
	})
	contractTemplate?: ContractTemplate;

	@Column({
		defaultValue: true,
		type: DataTypes.BOOLEAN,
	})
	isActive: boolean;

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

	@Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

	// @BeforeCreate
	// static beforeCreateHook = async (instance) => {
	// 	const instanceData = await contractTemplateVersionHook(instance);
	// };

	@AfterCreate
	static afterCreateHook = async (instance) => {
		await contractTemplateVersionHook(instance);
	};

	@DeletedAt
	deletedAt: Date;

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
