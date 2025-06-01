import TransportRequestController from '@/controllers/transport.request.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportRequestCreateSchema,
	TransportRequestUpdateSchema,
} from '@/validationSchema/transport.request.validation';
import { Router } from 'express';

class TransportRequestRoute implements Routes {
	public path = '/transport-request';
	public router = Router();
	public TransportRequestController = new TransportRequestController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.View),
			this.TransportRequestController.getAllTransportRequest,
		); // Get All Transport Request (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportRequestController.getTransportRequestById,
		); // Get Transport Request By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Create),
			validationMiddleware(TransportRequestCreateSchema, 'body'),
			this.TransportRequestController.addTransportRequest,
		); // Add Transport Request (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(TransportRequestUpdateSchema, 'body'),
			this.TransportRequestController.updateTransportRequest,
		); // Update Transport Request (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportRequestController.deleteTransportRequest,
		); // Delete Transport Request (Private)
	}
}

export default TransportRequestRoute;
