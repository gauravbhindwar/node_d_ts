import ImportLogController from '@/controllers/importLog.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { Router } from 'express';

class ImportLogRoutes implements Routes {
	public path = '/import-log';
	public router = Router();
	public importLogController = new ImportLogController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ImportLog, PermissionEnum.View),
			this.importLogController.findAllImportLogData,
		); // Get All Import Log (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ImportLog, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.importLogController.findImportLogItemsServiceById,
		); // Get Import Log By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ImportLog, PermissionEnum.Create),
			multerInterceptorConfig('employeeFile', [], 50 * 1024).single('employeeFile'),
			this.importLogController.addImportEmployee,
		); // Add Import Log (Private)
	}
}

export default ImportLogRoutes;
