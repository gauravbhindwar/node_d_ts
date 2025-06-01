export interface ITimesheetScheduleCreate {
  status: string;
  employeeId: number;
  bonusCode: string | null;
  date: Date;
}

export interface TimesheetScheduleAttributes {
  id?: number;
  status: string;
  statusId?: number;
  bonusCode: string | null;
  isLeaveForTitreDeConge?: boolean;
  employeeId?: number;
  date: Date;
  dbKey: string;
  overtimeHours: number;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
}
