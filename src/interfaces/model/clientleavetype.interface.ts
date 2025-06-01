export enum employee_type {
  ALL = "ALL",
  RESIDENT = "RESIDENT",
  ROTATION = "ROTATION",
}

export enum client_attendance_type {
  WORKED = "WORKED",
  LEAVE = "LEAVE",
  BONUS = "BONUS",
  HOLIDAY = "HOLIDAY",
}

export enum bonus_type {
  HOURLY = "HOURLY",
  RELIQUAT = "RELIQUAT",
}

export interface clientNewCreateType {
  id: number;
  employee_type?: string;
  code?: string;
  bonus_type?: string;
  payment_type?: string;
  reliquatValue?: string;
  conditions?: string;
  // factor1?: string;
  // factor2?: string;
  dates?: string[];
}

export interface clientNewAttendanceTypeAttributes {
  id?: number;
  clientId: number;
  status_type?: string;
  statusId?: number;
  status_code?: string;
  type?: string;
  conditions?: string;
  // factor1?: string;
  // factor2?: string;
  reliquatValue?: string;
  bonus_type?: string;
  payment_type?: string;
  dates?: string[];
  employee_type?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}
