import { RequiredKey } from './common.interface';

export interface IMessageDetailCreate {
	id?: number;
	messageId: number;
	employeeId?: number | null;
	segmentId?: number | null;
	managerUserId?: number | null;
	deletedAt?: Date | string;
}
export interface MessageDetailAttributes {
	id?: number;
	messageId: number;
	employeeId?: number;
	segmentId?: number;
	managerUserId?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredMessageDetailAttributes = RequiredKey<MessageDetailAttributes, 'id'>;
