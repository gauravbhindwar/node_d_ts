export enum payment_type {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export interface LeaveTypeMasterAttributes {
  id: number;
  name?: string;
  code?: string;
  slug?: string;
  payment_type?: string;
  description?: string;
  deletedAt?: string;
}
