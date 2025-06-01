import { RequiredKey } from './common.interface';

export interface IFileTokenCreate {
	id?: number;
	token: string;
}
export interface FileTokenAttributes {
	id?: number;
	token: string;
}

export type RequiredFileTokenAttributes = RequiredKey<FileTokenAttributes, 'id'>;
