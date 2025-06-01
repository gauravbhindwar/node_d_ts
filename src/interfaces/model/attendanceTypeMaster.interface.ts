
export interface IAttendanceTypeMasterCreate {
    id: number;
    name?: string;
    code?: string;
    slug?: string;
    description?: string;
  }

export interface AttendanceTypeMasterAttributes {
    id: number;
    name?: string;
    code?: string;
    slug?: string;
    description?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}



