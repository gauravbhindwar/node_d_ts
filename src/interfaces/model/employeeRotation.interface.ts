export interface IEmployeeRotationCreate {
	employeeId: number;
	rotationId: number;
}

export interface EmployeeRotationAttributes {
	id?: number;
	employeeId: number;
	rotationId: number;
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
