export interface IReliquatPaymentCreate {
	clientId: number;
	employeeId: number;
	startDate: Date | string;
	utcstartDate?: string;
	amount: number;
}

export interface ReliquatPaymentAttributes {
	id: number;
	clientId?: number;
	employeeId: number;
	startDate?: Date | string;
	utcstartDate?: string;
	amount?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
