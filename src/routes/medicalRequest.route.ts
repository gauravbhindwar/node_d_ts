import MedicalRequestController from '@/controllers/medicatRequest.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { MedicalRequestCreateSchema } from '@/validationSchema/medicalRequest.validation';
import { Router } from 'express';

class MedicalRequestRoute implements Routes {
	public path = '/medical-request';
	public router = Router();
	public medicalRequestController = new MedicalRequestController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalRequest, PermissionEnum.View),
			this.medicalRequestController.findAllMedicalRequests,
		); // Get All Medical Requests (Private)

		this.router.get(
			`${this.path}/medical-expiry`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalRequest, PermissionEnum.View),
			this.medicalRequestController.findAllMedicalExpiryRequests,
		); // Get All Medical Expiry (Private)
		
		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalRequest, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.medicalRequestController.findMedicalRequestById,
		); // (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalRequest, PermissionEnum.Create),
			validationMiddleware(MedicalRequestCreateSchema, 'body'),
			this.medicalRequestController.addMedicalRequest,
		); // Add Medical Request (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.MedicalRequest, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			this.medicalRequestController.updateMedicalRequestStatus,
		); // Update Medical Request Status (Private)
	}
}
export default MedicalRequestRoute;
