import { RequiredKey } from './common.interface';

export interface ITransportVehicleCreate {
	clientId?: number;
	vehicleNo: string;
	year: number;
	typeId: number;
	modelId: number;
	capacity: string;
	unavailableDates: string;
}
export interface TransportVehicleAttributes {
	id: number;
	vehicleNo: string;
	year: number;
	typeId: number;
	modelId: number;
	capacity: string;
	clientId?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	unavailableDates: string;
}

export type RequiredTransportVehicleAttributes = RequiredKey<TransportVehicleAttributes, 'vehicleNo'>;
