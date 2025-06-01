import { RequiredKey } from './common.interface';
import { RequestDocumentAttributes } from './request.document.interface';

export enum status {
	NEW = 'NEW',
	STARTED = 'STARTED',
	DECLINED = 'DECLINED',
	COMPLETED = 'COMPLETED',
}

export enum collectionDelivery {
	COLLECTION = 'COLLECTION',
	DELIVERY = 'DELIVERY',
}

export interface IRequestCreate {
	clientId?: number;
	employeeId?: number;
	contractId?: number;
	name: string;
	contractNumber: string;
	mobileNumber: string;
	email: string;
	emailDocuments: boolean;
	collectionDelivery: collectionDelivery;
	deliveryDate: Date | string;
	documentTotal: number;
	status: status;
	reviewedDate: Date | string;
	reviewedBy: number;
	requestDocument?: RequestDocumentAttributes[];
	utcdeliveryDate?:string;
}
export interface RequestAttributes {
	id: number;
	clientId?: number;
	employeeId?: number;
	contractId?: number;
	name: string;
	contractNumber: string;
	mobileNumber: string;
	email: string;
	emailDocuments: boolean;
	collectionDelivery: collectionDelivery;
	deliveryDate: Date | string;
	documentTotal: number;
	status: status;
	reviewedDate?: Date | string;
	reviewedBy?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	utcdeliveryDate?: string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredRequestAttributes = RequiredKey<RequestAttributes, 'contractNumber'>;
