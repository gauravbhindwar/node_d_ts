import ReliquatPaymentController from '@/controllers/reliquatPayment.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	ReliquatPaymentCreateSchema,
	ReliquatPaymentUpdateSchema,
} from '@/validationSchema/reliquatPayment.validation';
import { Router } from 'express';

class ReliquatPaymentRoute implements Routes {
	public path = '/reliquat-payment';
	public router = Router();
	public reliquatPaymentController = new ReliquatPaymentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatPayment, PermissionEnum.View),
			this.reliquatPaymentController.findAllReliquatPayments,
		); // Get All Reliquat Payment (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatPayment, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.reliquatPaymentController.findReliquatPaymentById,
		); // Get Reliquat Payment By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatPayment, PermissionEnum.Create),
			validationMiddleware(ReliquatPaymentCreateSchema, 'body'),
			this.reliquatPaymentController.addReliquatPayment,
		); // Add Reliquat Payment (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatPayment, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(ReliquatPaymentUpdateSchema, 'body'),
			this.reliquatPaymentController.updateReliquatPayment,
		); // Update Reliquat Payment (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatPayment, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.reliquatPaymentController.deleteReliquatPayment,
		); // Delete Reliquat Payment (Private)
	}
}

export default ReliquatPaymentRoute;
