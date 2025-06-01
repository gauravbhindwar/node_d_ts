import BonusTypeController from '@/controllers/bonusType.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import {
	BonusTypeCreateSchema,
	BonusTypeStatusUpdateSchema,
	BonusTypeUpdateSchema,
} from '@/validationSchema/bonusType.validation';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { Router } from 'express';

class BonusTypeRoute implements Routes {
	public path = '/bonus-type';
	public router = Router();
	public bonusTypeController = new BonusTypeController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.View),
			this.bonusTypeController.findAllBonusType,
		); // Get All Bonus Type (Private)

		this.router.get(
			`${this.path}/get-bonus-type-data`,
			authMiddleware,
			this.bonusTypeController.getBonusTypeDropdownData,
		); // Get Bonus Type Dropdown Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.bonusTypeController.findBonusTypeById,
		); // Get Bonus Type By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.Create),
			validationMiddleware(BonusTypeCreateSchema, 'body'),
			this.bonusTypeController.addBonusType,
		); //Add Bonus Type (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(BonusTypeStatusUpdateSchema, 'body'),
			this.bonusTypeController.updateBonusTypeStatus,
		); // Update Bonus Type Status (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(BonusTypeUpdateSchema, 'body'),
			this.bonusTypeController.updateBonusType,
		); // Update Bonus Type By Bonus Type Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.BonusType, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.bonusTypeController.deleteBonusType,
		); // Delete Bonus Type (Private)
	}
}

export default BonusTypeRoute;
