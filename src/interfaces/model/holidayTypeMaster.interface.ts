export enum payment_type {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export interface HolidayTypeMasterAttributes {
  id: number;
  name?: string;
  code?: string;
  label?: string;
  slug?: string;
  description?: string;
  deletedAt?: string;
}
