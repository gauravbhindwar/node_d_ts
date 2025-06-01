import TransportDriverController from '@/controllers/transport.driver.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportDriverCreateSchema,
	TransportDriverUpdateSchema,
} from '@/validationSchema/transport.driver.validation';
import { Router } from 'express';

class TransportDriverRoute implements Routes {
	public path = '/transport-driver';
	public router = Router();
	public TransportDriverController = new TransportDriverController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.View),
			this.TransportDriverController.getAllTransportDriver,
		); // Get All Transport Driver (Private)

		this.router.get(
			`${this.path}/available-driver`,
			authMiddleware,
			this.TransportDriverController.getAvailableTransportDriver,
		); // Get Available Transport Driver

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportDriverController.getTransportDriverById,
		); // Get Transport Driver By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Create),
			validationMiddleware(TransportDriverCreateSchema, 'body'),
			this.TransportDriverController.addTransportDriver,
		); // Add Transport Driver (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(TransportDriverUpdateSchema, 'body'),
			this.TransportDriverController.updateTransportDriver,
		); // Update Transport Driver (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportDriverController.deleteTransportDriver,
		); // Delete Transport Driver (Private)
	}
}

export default TransportDriverRoute;
