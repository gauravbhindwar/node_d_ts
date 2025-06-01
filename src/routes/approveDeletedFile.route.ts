import ApproveDeletedFileController from '@/controllers/approveDeletedFile.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';

class ApproveDeletedFileRoutes implements Routes {
	public path = '/approve-deleted-file';
	public router = Router();
	public approveDeletedFileController = new ApproveDeletedFileController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ApproveDeletedFile, PermissionEnum.View),
			this.approveDeletedFileController.findAllApproveDeletedFile,
		); // Get All Contract Template (Private)

		this.router.delete(
			`${this.path}/delete-file`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ApproveDeletedFile, PermissionEnum.Delete),
			this.approveDeletedFileController.deleteApproveDeletedFile,
		); // Delete Approve Deleted File (Private)

		this.router.put(
			`${this.path}/restore-file`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ApproveDeletedFile, PermissionEnum.Create),
			this.approveDeletedFileController.restoreApproveDeletedFile,
		); // Delete Approve Deleted File (Private)
	}
}

export default ApproveDeletedFileRoutes;
