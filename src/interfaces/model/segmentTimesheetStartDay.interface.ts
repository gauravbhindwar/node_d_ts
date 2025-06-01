export interface ISegmentTimesheetStartDayCreate {
	clientId: number;
	segmentId: number;
	timesheetStartDay: number;
}

export interface SegmentTimesheetStartDayAttributes {
	id?: number;
	clientId: number;
	segmentId: number;
	timesheetStartDay: number;
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
