export interface UserBankDetailsAttibutes {
  id?: number;
  loginUserId: number;
  name?: string | null;
  ribNumber?: number;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
  createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}

export interface addBankAccount {
    loginUserId: number;
    name?: string | null;
    ribNumber?: number;
}
