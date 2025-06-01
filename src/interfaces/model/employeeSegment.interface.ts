export interface IEmployeeSegmentCreate {
	employeeId: number;
	segmentId?: number | null;
	subSegmentId?: number | null;
	rollover?: boolean;
}

export interface EmployeeSegmentAttributes {
	id?: number;
	employeeId: number;
	segmentId: number;
	subSegmentId: number;
	rollover?: boolean;
	date: Date;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
