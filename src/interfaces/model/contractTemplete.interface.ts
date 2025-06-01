import { RequiredKey } from './common.interface';

export interface IContractTemplateCreate {
	contractName: string;
	clientId: number;
	isActive: boolean;
}
export interface ContractTemplateAttributes {
	id?: number;
	clientId: number;
	contractName?: string;
	isActive: boolean;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredContractTemplateAttributes = RequiredKey<ContractTemplateAttributes, 'id'>;
