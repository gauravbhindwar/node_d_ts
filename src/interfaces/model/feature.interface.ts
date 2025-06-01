import { RequiredKey } from './common.interface';

export interface ICreateUpdateFeature {
	name: string;
	permission: string[];
}

export interface FeaturesAttributes {
	id?: number;
	name: string;
	type?: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	updatedatutc?: string;
	createdatutc?: string;
	deletedatutc?: string;
}

export type RequiredFeaturesAttributes = RequiredKey<FeaturesAttributes, 'name'>;
