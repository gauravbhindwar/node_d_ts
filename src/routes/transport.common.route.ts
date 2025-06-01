import TransportCommonController from '@/controllers/transport.common.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	TransportCommonCreateSchema,
	TransportCommonUpdateSchema,
	paramsIdTypeSchema,
} from '@/validationSchema/transport.common.validation';
import { Router } from 'express';

class TransportCommonRoute implements Routes {
	public path = '/transport';
	public router = Router();
	public TransportCommonController = new TransportCommonController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.TransportSummary, PermissionEnum.View),
			this.TransportCommonController.getAllCommonTransport,
		); // Get All Common Transport (Private)

		this.router.get(`${this.path}/get-transport-data`, authMiddleware, this.TransportCommonController.getTransportData); // Get Transport Data (Public)

		this.router.get(
			`${this.path}/:id/:type`,
			authMiddleware,
			validationMiddleware(paramsIdTypeSchema, 'params'),
			rolePermissionMiddleware(FeaturesNameEnum.TransportSummary, PermissionEnum.View),
			this.TransportCommonController.getCommonTransportById,
		); // Get Common Transport By Id

		this.router.post(
			`${this.path}`,
			authMiddleware,
			validationMiddleware(TransportCommonCreateSchema, 'body'),
			rolePermissionMiddleware(FeaturesNameEnum.TransportSummary, PermissionEnum.Create),
			this.TransportCommonController.addCommonTransport,
		); // Add Common Transport

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(TransportCommonUpdateSchema, 'body'),
			rolePermissionMiddleware(FeaturesNameEnum.TransportSummary, PermissionEnum.Update),
			this.TransportCommonController.updateCommonTransport,
		); // Update Common Transport

		this.router.delete(
			`${this.path}/:id/:type`,
			authMiddleware,
			validationMiddleware(paramsIdTypeSchema, 'params'),
			rolePermissionMiddleware(FeaturesNameEnum.TransportSummary, PermissionEnum.Delete),
			this.TransportCommonController.deleteCommonTransport,
		); // Delete Common Transport
	}
}

export default TransportCommonRoute;
