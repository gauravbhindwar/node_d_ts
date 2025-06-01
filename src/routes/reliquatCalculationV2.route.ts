import ReliquatCalculationV2Controller from '@/controllers/reliquatCalculationV2.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';

class ReliquatCalculationV2Routes implements Routes {
	public path = '/reliquat-calculation-v2';
	public router = Router();
	public reliquatCalculationV2Controller = new ReliquatCalculationV2Controller();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatCalculationV2, PermissionEnum.View),
			this.reliquatCalculationV2Controller.findAllReliquatCalculationV2,
		); // Get Reliquat Calculation V2 (Private)

		this.router.get(
			`${this.path}/get-employee-reliquat`,
			authMiddleware,
			this.reliquatCalculationV2Controller.getEmployeeReliquat,
		); // Get Reliquat Calculation V2 (Public)
	}
}

export default ReliquatCalculationV2Routes;
