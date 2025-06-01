import { RequiredKey } from './common.interface';
import { status } from './user.interface';

export enum messageStatus {
	SENT = 'SENT',
	DRAFT = 'DRAFT',
	ERROR = 'ERROR',
}
export interface IErrorLogsCreate {
	id?: number;
	clientId?: number | null;
	type: string;
	email?: string;
	error_message: string;
	full_error: string;
	status: messageStatus;
	isActive: status;
	createdAt?: Date | string;
	createdBy?: number | null;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}
export interface ErrorLogsAttributes {
	id?: number;
	clientId?: number;
	type: string;
	error_message: string;
	email: string;
	full_error: string;
	isActive: status;
	status: messageStatus;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredErrorLogsAttributes = RequiredKey<ErrorLogsAttributes, 'id'>;
