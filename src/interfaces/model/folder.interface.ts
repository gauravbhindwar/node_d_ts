import { RequiredKey } from './common.interface';

export interface IFolderCreate {
	name: string;
	// index: number;
	typeId: number;
}

export interface FolderAttributes {
	id: number;
	name: string;
	index: number;
	typeId: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	updatedatutc?:string;
	createdatutc?:string;
	deletedatutc?:string;
}

// export type RequiredFolderAttributes = RequiredKey<FolderAttributes, 'index'>;
