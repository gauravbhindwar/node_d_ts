import RequestController from '@/controllers/request.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { RequestCreateSchema, RequestStatusUpdateSchema } from '@/validationSchema/request.validation';
import { Router } from 'express';

class RequestRoute implements Routes {
	public path = '/request';
	public router = Router();
	public RequestController = new RequestController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Request, PermissionEnum.View),
			this.RequestController.getAllRequest,
		); // Get All Request (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Request, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.RequestController.getRequestById,
		); // Get Request By Id (Private)

		this.router.post(
			`${this.path}`,
			// authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.Request, PermissionEnum.Create),
			validationMiddleware(RequestCreateSchema, 'body'),
			this.RequestController.addRequest,
		); // Add Request (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Request, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(RequestStatusUpdateSchema, 'body'),
			this.RequestController.updateRequestStatus,
		); // Update Request Status (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Request, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.RequestController.deleteRequest,
		); // Delete Request (Private)
	}
}

export default RequestRoute;
