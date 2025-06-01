import ReliquatCalculationController from '@/controllers/reliquatCalculation.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';

class ReliquatCalculationRoutes implements Routes {
	public path = '/reliquat-calculation';
	public router = Router();
	public reliquatCalculationController = new ReliquatCalculationController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatCalculation, PermissionEnum.View),
			this.reliquatCalculationController.findAllReliquatCalculation,
		); // Get All Reliquat Calculation (Private)

		this.router.get(
			`${this.path}/employee-contract-list`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ReliquatCalculation, PermissionEnum.View),
			this.reliquatCalculationController.employeContractList,
		)
		this.router.post(`${this.path}`, 
			authMiddleware, 
			this.reliquatCalculationController.generateReliquat); // Get All Reliquat Calculation (Private)
	
		this.router.post(`${this.path}/create-monthly`, 
			authMiddleware, 
			this.reliquatCalculationController.createmonthlyReliquat); // Get All Reliquat Calculation (Private)

	}


}

export default ReliquatCalculationRoutes;
