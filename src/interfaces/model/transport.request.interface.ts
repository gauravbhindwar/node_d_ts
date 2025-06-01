export enum transportStatus {
	DRAFT = 'DRAFT',
	STARTED = 'STARTED',
	INPROGRESS = 'INPROGRESS',
	COMPLETED = 'COMPLETED',
}

export interface ITransportRequestCreate {
	clientId?: number;
	source: string;
	startDate: Date | string;
	destination: string;
	destinationDate: Date | string;
	status: transportStatus;
}

export interface TransportRequestAttributes {
	id: number;
	clientId?: number;
	source: string;
	startDate: Date | string;
	destination: string;
	destinationDate: Date | string;
	status: transportStatus;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
	utcstartDate?:string;
	utcdestinationDate?:string;
}
