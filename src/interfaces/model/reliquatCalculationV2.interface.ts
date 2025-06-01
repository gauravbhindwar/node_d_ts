export interface ReliquatCalculationV2Attributes {
	id?: number;
	clientId: number;
	timesheetId: number;
	employeeId: number;
	rotationName: string;
	segmentName: string;
	taken?: number;
	presentDay?: number;
	earned?: number;
	earnedTaken?: number;
	totalWorked?: number;
	weekend?: number;
	overtime?: number;
	adjustment?: number;
	reliquatValue?: number|string;
	reliquatPayment?: number;
	reliquat?: number;
	startDate?: Date | string;
	endDate?: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
