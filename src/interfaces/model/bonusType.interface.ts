export interface IBonusTypeCreate {
  code: string;
  name: string;
  basePrice: number | null;
  timesheetName: string;
  isActive: boolean;
  dailyCost: number;
}

export interface BonusTypeAttributes {
  id?: number;
  code: string;
  name: string;
  basePrice: number | null;
  timesheetName: string | null;
  isActive?: boolean;
  dailyCost?: number | null;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
