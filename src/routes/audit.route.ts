import AuditLogsController from '@/controllers/audit.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';

class AuditLogsRoutes implements Routes {
	public path = '/audit';
	public router = Router();
	public auditLogsController = new AuditLogsController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.AuditLogs, PermissionEnum.View),
			this.auditLogsController.findAllAuditLogs,
		); // Get All Error Logs

	}
}

export default AuditLogsRoutes;
