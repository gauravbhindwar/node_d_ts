export interface IRequestDocumentCreate {
	requestId?: number;
	documentType: number;
	otherInfo?: string;
	completedBy?: number;
	completedDate?: Date | string;
}

export enum requestStatus {
	ACTIVE = 'ACTIVE',
	DECLINED = 'DECLINED',
	PENDING = 'PENDING'
}

export interface RequestDocumentAttributes {
	id: number;
	requestId?: number;
	documentType: number;
	otherInfo?: string;
	completedBy?: number;
	status?: requestStatus;
	completedDate: Date | string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;


  filePath?: string;     // ADD THIS
  fileName?: string;     // ADD THIS if missing too
  uploadedBy?: number;   // ADD THIS if missing too
}
