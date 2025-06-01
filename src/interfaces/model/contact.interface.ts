import { RequiredKey } from './common.interface';

export interface IContactCreate {
	name: string;
	email: string;
	address1: string;
	slug?: string;
	address2?: string;
	address3?: string;
	address4?: string;
	city: string;
	region: string;
	postalCode: string;
	country: string;
	dueDateDays?: number;
	brandingTheme?: string;
	clientId?: number;
}
export interface ContactAttributes {
	id: number;
	name: string;
	email: string;
	address1: string;
	address2?: string;
	address3?: string;
	address4?: string;
	city: string;
	region: string;
	postalCode: string;
	country: string;
	dueDateDays?: number;
	brandingTheme?: string;
	clientId?: number;
	slug?: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?: string;
	updatedatutc?: string;
	deletedatutc?: string;
}

export type RequiredContactAttributes = RequiredKey<ContactAttributes, 'email'>;
