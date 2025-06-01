import TransportRequestVehicleController from '@/controllers/transport.request.vehicle.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportRequestVehicleCreateSchema,
	TransportRequestVehicleUpdateSchema,
} from '@/validationSchema/transport.request.vehicle.validation';
import { Router } from 'express';

class TransportRequestVehicleRoute implements Routes {
	public path = '/transport-request-vehicle';
	public router = Router();
	public TransportRequestVehicleController = new TransportRequestVehicleController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.View),
			this.TransportRequestVehicleController.getAllTransportRequestVehicle,
		); // Get All Transport Vehicle Request (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportRequestVehicleController.getTransportRequestVehicleById,
		); // Get Transport Vehicle Request By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Create),
			validationMiddleware(TransportRequestVehicleCreateSchema, 'body'),
			this.TransportRequestVehicleController.addTransportRequestVehicle,
		); // Add Transport Vehicle Request (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(TransportRequestVehicleUpdateSchema, 'body'),
			this.TransportRequestVehicleController.updateTransportRequestVehicle,
		); // Update Transport Vehicle Request (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportRequest, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportRequestVehicleController.deleteTransportRequestVehicle,
		); // Delete Transport Vehicle Request (Private)
	}
}

export default TransportRequestVehicleRoute;
