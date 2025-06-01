import { RequiredKey } from './common.interface';

export enum messageStatus {
	SENT = 'SENT',
	DRAFT = 'DRAFT',
	ERROR = 'ERROR',
}
export interface IMessageCreate {
	id?: number;
	messageId: number;
	employeeId?: string[] | null;
	segmentId?: string[] | null;
	errorMessage?: string | null;
	managerUserId?: string[] | null;
	clientId: number;
	message: string;
	status: messageStatus;
	isSchedule?: boolean;
	scheduleDate?: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
export interface MessageAttributes {
	id?: number;
	clientId: number;
	message: string;
	errorMessage?: string;
	isSchedule: boolean;
	scheduleDate: Date | string;
	status: messageStatus;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredMessageAttributes = RequiredKey<MessageAttributes, 'id'>;
