export enum timesheetLogsStatus {
	APPROVED = 'APPROVED',
	UNAPPROVED = 'UNAPPROVED',
}
export interface ITimesheetLogsCreate {
	timesheetId: number;
	status?: string;
	actionDate: Date;
	actionBy: number;
}

export interface ITimesheetLogsAttributes {
	id?: number;
	timesheetId: number;
	status?: timesheetLogsStatus;
	actionDate: Date;
	actionBy: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
