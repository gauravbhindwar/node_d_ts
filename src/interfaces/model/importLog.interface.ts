import { RequiredKey } from './common.interface';

export interface IImportLogCreate {
	clientId: number;
	fileName?: string;
	rowNo: number;
	startDate: Date | string;
	endDate: Date | string;
	createdAt?: Date | string;
	createdBy?: number | null;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}
export interface ImportLogAttributes {
	id?: number;
	clientId: number;
	fileName?: string;
	rowNo: number;
	startDate: Date | string;
	endDate: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredImportLogAttributes = RequiredKey<ImportLogAttributes, 'id'>;
