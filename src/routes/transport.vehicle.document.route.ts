import TransportVehicleDocumentController from '@/controllers/transport.vehicle.document.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportVehicleDocumentCreateSchema,
	TransportVehicleDocumentUpdateSchema,
} from '@/validationSchema/transport.vehicle.document.validation';
import { Router } from 'express';

class TransportVehicleDocumentRoute implements Routes {
	public path = '/transport-vehicle-document';
	public router = Router();
	public TransportVehicleDocumentController = new TransportVehicleDocumentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.View),
			this.TransportVehicleDocumentController.getAllTransportVehicleDocument,
		); // Get All Transport Vehicle Documents (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportVehicleDocumentController.getTransportVehicleDocumentById,
		); // Get Transport Vehicle Document By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Create),
			multerInterceptorConfig('vehicleDocuments', [], 50 * 1024, TransportVehicleDocumentCreateSchema, 'body').single(
				'documentPath',
			),
			validationMiddleware(TransportVehicleDocumentCreateSchema, 'body'),
			this.TransportVehicleDocumentController.addTransportVehicleDocument,
		); // Add Transport Vehicle Document (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multerInterceptorConfig('vehicleDocuments', [], 50 * 1024, TransportVehicleDocumentUpdateSchema, 'body').single(
				'documentPath',
			),
			validationMiddleware(TransportVehicleDocumentUpdateSchema, 'body'),
			this.TransportVehicleDocumentController.updateTransportVehicleDocument,
		); // Update Transport Vehicle Document (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportVehicle, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportVehicleDocumentController.deleteTransportVehicleDocument,
		); // Delete Transport Vehicle Document (Private)
	}
}

export default TransportVehicleDocumentRoute;
