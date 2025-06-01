import { RequiredKey } from './common.interface';

export interface ITransportCapacityCreate {
	value: number;
	clientId?: number;
}
export interface TransportCapacityAttributes {
	id: number;
	value: number;
	clientId?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredTransportCapacityAttributes = RequiredKey<TransportCapacityAttributes, 'value'>;
