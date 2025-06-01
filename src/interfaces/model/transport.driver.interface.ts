import { RequiredKey } from './common.interface';

export interface ITransportDriverCreate {
	clientId?: number;
	driverNo: string;
	firstName: string;
	lastName: string;
	positionId: number;
	companyStart: Date | string;
	experienceStart: Date | string;
	unavailableDates: string;
}

export interface TransportDriverAttributes {
	id: number;
	clientId?: number;
	driverNo: string;
	firstName: string;
	lastName: string;
	positionId: number;
	companyStart: Date | string;
	experienceStart: Date | string;
	unavailableDates: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
	utcexperienceStart?:string;
	utccompanyStart?:string;
}

export type RequiredTransportDriverAttributes = RequiredKey<TransportDriverAttributes, 'driverNo'>;
