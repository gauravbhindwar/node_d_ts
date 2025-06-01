import TransportVehicleController from '@/controllers/transport.vehicle.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportVehicleCreateSchema,
	TransportVehicleUpdateSchema,
} from '@/validationSchema/transport.vehicle.validation';
import { Router } from 'express';

class TransportVehicleRoute implements Routes {
	public path = '/transport-vehicle';
	public router = Router();
	public TransportVehicleController = new TransportVehicleController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.View),
			this.TransportVehicleController.getAllTransportVehicle,
		); // Get All Transport Vehicles (Private)

		this.router.get(
			`${this.path}/available-vehicle`,
			authMiddleware,
			this.TransportVehicleController.getAvailableTransportVehicles,
		); // Get Available Transport Vehicle (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportVehicleController.getTransportVehicleById,
		); // Get Transport Vehicle By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Create),
			validationMiddleware(TransportVehicleCreateSchema, 'body'),
			this.TransportVehicleController.addTransportVehicle,
		); // Add Transport Vehicle (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(TransportVehicleUpdateSchema, 'body'),
			this.TransportVehicleController.updateTransportVehicle,
		); // Update Transport Vehicle (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportVehicleController.deleteTransportVehicle,
		); // Delete Transport Vehicle (Private)
	}
}

export default TransportVehicleRoute;
