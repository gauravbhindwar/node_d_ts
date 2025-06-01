export interface ITransportVehicleDocumentCreate {
	clientId?: number;
	vehicleId: number;
	folderId: number;
	documentName: string;
	documentPath: string;
	documentSize: number;
	issueDate: Date | string;
	expiryDate: Date | string;
}

export interface TransportVehicleDocumentAttributes {
	id: number;
	clientId?: number;
	vehicleId: number;
	folderId: number;
	documentName: string;
	documentPath: string;
	documentSize: number;
	issueDate: Date | string;
	expiryDate: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
