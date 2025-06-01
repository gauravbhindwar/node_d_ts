export enum queueStatus {
	PENDING = 'PENDING',
	INPROGRESS = 'INPROGRESS',
	COMPLETED = 'COMPLETED',
	RETAKE = 'RETAKE',
	FAILED = 'FAILED',
}

export interface QueueAttributes {
	id: number;
	processName: string;
	clientId?: number;
	employeeId?: number;
	clientEndDate?: Date;
	startDate?: Date | null;
	endDate?: Date | null;
	status?: queueStatus;
	error?: string;
	totalTakes?: number | null;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
