import { RequiredKey } from './common.interface';

export interface IGlobalSettingsCreate {
  timezone_utc: string;
  dateformat: string;
  timeformat: string;
}

export interface GlobalSettingsAttributes {
  id?: number;
  timezone_utc: string;
  dateformat: string;
  timeformat: string;
  deletedAt?: Date | string;
}

export type RequiredGlobalSettingsAttributes = RequiredKey<GlobalSettingsAttributes, 'timezone_utc' | 'dateformat' | 'timeformat'>;
