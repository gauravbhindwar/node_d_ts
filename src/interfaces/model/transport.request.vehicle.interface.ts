export interface ITransportRequestVehicleCreate {
	clientId?: number;
	requestId?: number;
	driverId: number;
	vehicleId: number;
}

export interface TransportRequestVehicleAttributes {
	id: number;
	clientId?: number;
	requestId?: number;
	driverId: number;
	vehicleId: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
