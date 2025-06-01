import { RequiredKey } from './common.interface';

export interface IRequestTypeCreate {
	name: string;
	notificationEmails?: string;
	isActive?: boolean;
}

export interface RequestTypeAttributes {
	id: number;
	name: string;
	notificationEmails?: string;
	isActive?: boolean;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredRequestTypeAttributes = RequiredKey<RequestTypeAttributes, 'name'>;
