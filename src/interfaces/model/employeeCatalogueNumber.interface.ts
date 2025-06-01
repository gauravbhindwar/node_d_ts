export interface IEmployeeCatalogueNumberCreate {
	id?: number;
	catalogueNumber: string | null;
	startDate?: Date | string;
	employeeId: number;
}

export interface EmployeeCatalogueNumberAttributes {
	id?: number;
	catalogueNumber: string | null;
	startDate?: Date | string;
	employeeId: number;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
