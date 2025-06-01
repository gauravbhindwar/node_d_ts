export interface IClientTimesheetStartDayCreate {
	clientId: number;
	timesheetStartDay: number;
}

export interface ClientTimesheetStartDayAttributes {
	id?: number;
	clientId: number;
	timesheetStartDay: number;
	date: Date;
	dateatutc: string;
	createdatutc: string;
	updatedatutc: string;
	deletedatutc: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
