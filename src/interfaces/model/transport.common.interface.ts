import { RequiredKey } from './common.interface';

export interface ITransportCommonCreate {
	name: string;
	clientId?: number;
	type: string;
}
export interface TransportCommonAttributes {
	id: number;
	name: string;
	clientId?: number;
	type: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredTransportCommonAttributes = RequiredKey<TransportCommonAttributes, 'name'>;
