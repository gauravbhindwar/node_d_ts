import { RequiredKey } from './common.interface';

export enum type {
	FORGOT = 'FORGOT',
	REGISTER = 'REGISTER',
}

export interface OtpAttributes {
	id?: number;
	otp?: number;
	type?: type;
	expired?: Date | string;
	email?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}

export type RequiredOtpAttributes = RequiredKey<OtpAttributes, 'otp'>;
