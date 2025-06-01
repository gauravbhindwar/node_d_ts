export enum status {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}
export interface IncrementRequestAttributes {
  id?: number;
  employeeId: number;
  employeeName: string;
  clientId: number;
  salaryIncrement: number;
  bonusIncrement: number;
  salaryIncrementPercent: number;
  bonusIncrementPercent: number;
  currentBonus: number;
  salaryDescription: string;
  bonusDescription: string;
  roleId?: number;
  status: status;
  createdAt?: Date | string;
  createdBy?: number;
  managerId?: number;
  managerStatus?: string;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
  managerRequestedDate?: string;
  currentSalary?: number;
}

export interface addSalaryBonusIncrement {
  salaryIncrement?: number | null;
  bonusIncrement?: number | null;
  salaryDescription?: string;
  bonusDescription?: string;
  clientId?: number;
  employeeId?: number;
}
