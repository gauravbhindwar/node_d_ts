export interface EmployeeSalaryAttributes {
	id?: number;
	employeeId: number;
	baseSalary: number;
	monthlySalary: number;
	dailyCost: number;
	startDate: Date | string;
	endDate: Date | string | null;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
