import MedicalTypeController from '@/controllers/medicalType.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { MedicalTypeCreateSchema, MedicalTypeUpdateSchema } from '@/validationSchema/medicalType.validation';
import { Router } from 'express';

class MedicalTypeRoute implements Routes {
	public path = '/medical-type';
	public router = Router();
	public medicalTypeController = new MedicalTypeController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalType, PermissionEnum.View),
			this.medicalTypeController.findAllMedicalTypes,
		); // Get All Medical Types (Private)

		this.router.get(
			`${this.path}/get-medical-type-data`,
			authMiddleware,
			this.medicalTypeController.getMedicalTypesData,
		); // Get Medical Types Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalType, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.medicalTypeController.findMedicalTypeById,
		); // Get Medical Type by Id (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalType, PermissionEnum.Create),
			validationMiddleware(MedicalTypeCreateSchema, 'body'),
			this.medicalTypeController.addMedicalType,
		); // Add Medical Type (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalType, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(MedicalTypeUpdateSchema, 'body'),
			this.medicalTypeController.updateMedicalType,
		); // Update Medical Type (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalType, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.medicalTypeController.deleteMedicalType,
		); // Delete Medical Type (Private)
	}
}
export default MedicalTypeRoute;
