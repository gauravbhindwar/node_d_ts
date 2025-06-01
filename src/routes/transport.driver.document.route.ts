import TransportDriverDocumentController from '@/controllers/transport.driver.document.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportDriverDocumentCreateSchema,
	TransportDriverDocumentUpdateSchema,
} from '@/validationSchema/transport.driver.document.validation';
import { Router } from 'express';

class TransportDriverDocumentRoute implements Routes {
	public path = '/transport-driver-document';
	public router = Router();
	public TransportDriverDocumentController = new TransportDriverDocumentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.View),
			this.TransportDriverDocumentController.getAllTransportDriverDocument,
		); // Get All Transport Driver Documents (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportDriverDocumentController.getTransportDriverDocumentById,
		); // Get Transport Driver Document By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Create),
			multerInterceptorConfig('driverDocuments', [], 50 * 1024, TransportDriverDocumentCreateSchema, 'body').single(
				'documentPath',
			),
			validationMiddleware(TransportDriverDocumentCreateSchema, 'body'),
			this.TransportDriverDocumentController.addTransportDriverDocument,
		); // Add Transport Driver Document (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multerInterceptorConfig('driverDocuments', [], 50 * 1024, TransportDriverDocumentUpdateSchema, 'body').single(
				'documentPath',
			),
			validationMiddleware(TransportDriverDocumentUpdateSchema, 'body'),
			this.TransportDriverDocumentController.updateTransportDriverDocument,
		); // Update Transport Driver Document (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportDriver, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.TransportDriverDocumentController.deleteTransportDriverDocument,
		); // Delete Transport Driver Document (Private)
	}
}

export default TransportDriverDocumentRoute;
