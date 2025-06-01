// export enum employee_type {
//     ALL = "ALL",
//     RESIDENT = "RESIDENT",
//     ROTATION = "ROTATION",
//   }

export enum bonus_type {
  HOURLY = "HOURLY",
  RELIQUAT = "RELIQUAT",
}

export interface BonusTypeMasterAttributes {
  id: number;
  name?: string;
  code?: string;
  // employee_type?: string;
  slug?: string;
  bonus_type?: string;
  description?: string;
  deletedAt?: string;
}
