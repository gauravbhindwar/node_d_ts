export interface IReliquatAdjustmentCreate {
  clientId: number;
  employeeId: number;
  adjustment: number;
  startDate: Date | string;
  utcstartDate?: string;
}

export interface ReliquatAdjustmentAttributes {
  id: number;
  clientId?: number;
  employeeId: number;
  startDate?: Date | string;
  utcstartDate?: string;
  adjustment?: number;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}
