import ReliquatAdjustmentController from '@/controllers/reliquatAdjustment.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	ReliquatAdjustmentCreateSchema,
	ReliquatAdjustmentUpdateSchema,
} from '@/validationSchema/reliquatAdjustment.validation';
import { Router } from 'express';

class ReliquatAdjustmentRoute implements Routes {
	public path = '/reliquat-adjustment';
	public router = Router();
	public reliquatAdjustmentController = new ReliquatAdjustmentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatAdjustment, PermissionEnum.View),
			this.reliquatAdjustmentController.findAllReliquatAdjustments,
		); // Get All Reliquat Adjustment (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatAdjustment, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.reliquatAdjustmentController.findReliquatAdjustmentById,
		); // Get Reliquat Adjustment By Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatAdjustment, PermissionEnum.Create),
			validationMiddleware(ReliquatAdjustmentCreateSchema, 'body'),
			this.reliquatAdjustmentController.addReliquatAdjustment,
		); // Add Reliquat Adjustment (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatAdjustment, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(ReliquatAdjustmentUpdateSchema, 'body'),
			this.reliquatAdjustmentController.updateReliquatAdjustment,
		); // Update Reliquat Adjustment (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatAdjustment, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.reliquatAdjustmentController.deleteReliquatAdjustment,
		); // Delete Reliquat Adjustment (Private)
	}
}

export default ReliquatAdjustmentRoute;
