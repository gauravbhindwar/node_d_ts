import ErrorLogsController from '@/controllers/errorLog.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';

class ErrorLogsRoutes implements Routes {
	public path = '/error-logs';
	public router = Router();
	public errorLogsController = new ErrorLogsController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ErrorLogs, PermissionEnum.View),
			this.errorLogsController.findAllErrorLogs,
		); // Get All Error Logs

		this.router.get(`${this.path}/categories`, authMiddleware, this.errorLogsController.findAllErrorLogsCategories); // (Public)
	}
}

export default ErrorLogsRoutes;
