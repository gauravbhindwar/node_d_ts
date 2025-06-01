import { RequiredKey } from "./common.interface";

export interface IRotationCreate {
  name: string;
  weekOn: number;
  weekOff: number;
  description: string;
  isResident: boolean;
  daysWorked: string;
  isAllDays: boolean;
  isWeekendBonus: boolean;
  isOvertimeBonus: boolean;
  annualHolidays: number;
  overtimeBonusType: string | null;
  overtimeHours: number | null;
}

export interface RotationAttributes {
  id: number;
  name: string;
  weekOn: number;
  weekOff: number;
  description: string;
  isResident: boolean;
  daysWorked: string;
  isAllDays: boolean;
  isWeekendBonus: boolean;
  isOvertimeBonus: boolean;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  annualHolidays: number;
  createdatutc?:string;
  updatedatutc?:string;
  deletedatutc?:string;
}

export type RequiredRotationAttributes = RequiredKey<
  RotationAttributes,
  "name"
>;
