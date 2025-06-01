export interface UserPermissionAttributes {
	id?: number;
	roleId?: number;
	permissionId: number;
	loginUserId?: number;
	clientId?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	createdatutc?:string;
	updatedatutc?:string;
	deletedatutc?:string;
}
