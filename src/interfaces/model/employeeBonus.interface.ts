export interface EmployeeBonusAttributes {
	id?: number;
	employeeId: number;
	bonusId: number;
	price: number;
	coutJournalier: number;
	catalogueNumber: string | null;
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
