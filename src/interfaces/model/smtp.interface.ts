import { RequiredKey } from './common.interface';

export enum type {
	FORGOT = 'FORGOT',
	REGISTER = 'REGISTER',
}

export interface SmtpAttributes {
	id?: number;
	host?: string;
	port?: number;
	secure?: boolean;
	username?: string;
	password?: string;
	isDefault?: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}

export type RequiredSmtpAttributes = RequiredKey<SmtpAttributes, 'host' | 'port' | 'username' | 'password'>;
