export enum status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
export interface UserAttributes {
  id?: number;
  loginUserId: number;
  roleId?: number;
  status: status;
  hashToken?: string;
  hashTokenExpiry?: Date;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}

export interface LoginUserAttributes {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  password?: string;
  randomPassword?: string;
  birthDate?: Date | string;
  placeOfBirth?: string;
  gender?: string;
  code?: string;
  phone?: string;
  profileImage?: string;
  timezone?: string;
  uniqueLoginId: string;
  isMailNotification?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
  timezone_utc?: string;
  dateformat?: string;
  timeformat?: string;
  language?: string;
  currency?: string;
  logintimeutc?: string;
  logouttimeutc?: string;
}

export interface UserClientAttributes {
  id?: number;
  userId: number;
  clientId?: number;
  segmentId?: number;
  roleId?: number;
  status: status;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}

export interface UserSegmentAttributes {
  id?: number;
  userId?: number;
  clientId?: number;
  segmentId?: number;
  subSegmentId?: number;
  createdAt?: Date | string;
  createdBy?: number;
  updatedAt?: Date | string;
  updatedBy?: number;
  deletedAt?: Date | string;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
}
