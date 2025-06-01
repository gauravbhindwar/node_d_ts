export enum status {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}
export enum actionType {
  TERMINATION = "TERMINATION",
  REACTIVATION = "REACTIVATION",
}

export interface EmployeeStatusRequestAttributes {
	id?: number;
  clientId: number;
	employeeId: number;
  requestBy: string;
  requestDate: string;
  requestType: actionType;
  roleId: number;
  reason: string;
  status: status;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
