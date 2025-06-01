import { RequiredKey } from './common.interface';

export interface IMessageDetailCreate {
	id?: number;
	message: string;
	employeeId?: number | null;
	managerUserId?: number | null;
	bonusPrice?: number | null;
	monthlySalary?: number;
	salaryMonth?: string;
	total?: number;
	salaryDate: Date;
	email: string;
	phone: string;
	deletedAt?: Date | string;
}
export interface MessageSalaryAttributes {
	id?: number;
	message: string;
	clientId?: number;
	employeeId?: number;
	managerUserId?: number;
	total?: number;
	bonusPrice?: number | null;
	salaryDate: Date;
	email: string;
	phone: string;
	salaryMonth?: string;
	monthlySalary?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export type RequiredMessageSalaryAttributes = RequiredKey<MessageSalaryAttributes, 'id'>;
