import { RequiredKey } from './common.interface';

export enum importLogStatus {
	OK = 'OK',
	INFO = 'INFO',
	ERROR = 'ERROR',
}
export interface IImportLogItemCreate {
	importLogId: number;
	description?: string;
	status: importLogStatus;
}
export interface ImportLogItemAttributes {
	id?: number;
	importLogId: number;
	description?: string;
	status: importLogStatus;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredImportLogItemAttributes = RequiredKey<ImportLogItemAttributes, 'id'>;
