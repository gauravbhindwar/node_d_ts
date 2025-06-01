export enum employeeLeaveStatus {
	ACTIVE = 'ACTIVE',
	CANCELLED = 'CANCELLED',
}

export interface IEmployeeLeaveCreate {
	employeeId: number;
	leaveType: string;
	startDate: Date | string;
	endDate: Date | string;
	utcstartDate?:string;
	utcendDate?: string;
}
export interface EmployeeLeaveAttributes {
	id: number;
	employeeId: number;
	reference: string;
	startDate: Date | string;
	endDate: Date | string;
	segmentId?: number;
	rotationId?: number;
	employeeContractEndDate?: Date | string;
	totalDays?: number;
	status: string;
	leaveType: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
	utcstartDate?:string;
	utcendDate?: string;
}
export interface EmployeeLeavePdfAttributes {
	reliquatCalculationData: number;
	dateDeRepriseEndDate: string;
	debutDeConge: string;
	dateDuRetour: string;
	droitDeConge: number;
	lieuDeSejour: string;
	id: number;
	employeeId: number;
	reference: string;
	startDate: Date | string;
	endDate: Date | string;
	segmentId?: number;
	rotationId?: number;
	employeeContractEndDate?: Date | string;
	totalDays?: number;
	status: string;
	leaveType: string;
	createdAt?: Date | string;
	createdAtTime?: string;
	updatedAtTime?: string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	date?: Date | string;
	createdByUser?: {
		loginUserData?: {
			name: string;
			email: string;
		};
	} | null;
	updatedByUser?: {
		loginUserData?: {
			name: string;
			email: string;
		};
	} | null;
	employeeDetail?: {
		fonction?: string;
		address?: string;
		segment?: { id: number; name: string };
		subSegment?: { id: number; name: string };
		client?: {
			titreDeConge?: string;
			stampLogo?: string | null;
			loginUserData?: {
				name: string;
				firstName: string;
				lastName: string;
				email: string;
			};
		};
		employeeNumber?: string;
		loginUserData?: {
			name: string;
			firstName: string;
			lastName: string;
			email: string;
		};
	};
}