import ContractTemplateController from '@/controllers/contractTemplate.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	ContractTemplateCreateSchema,
	ContractTemplateStatusUpdateSchema,
	ContractTemplateUpdateSchema,
} from '@/validationSchema/contractTemplate.validation';
import { Router } from 'express';
import multer from 'multer';

class ContractTemplateRoutes implements Routes {
	public path = '/contract-template';
	public router = Router();
	public contractTemplateController = new ContractTemplateController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.View),
			this.contractTemplateController.findAllContractTemplate,
		); // Get All Contract Template (Private)

		this.router.get(
			`${this.path}/get-contract-template-data`,
			authMiddleware,
			this.contractTemplateController.getContractTemplateData,
		); // Get Contract Template Data (Public)

		this.router.get(
			`${this.path}/get-contract-template-rotation-data`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.View),
			this.contractTemplateController.findContractTemplateServiceByRotationData,
		); // Get Contract Template By Rotation (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contractTemplateController.findContractTemplateServiceById,
		); // Get Contract Template By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.Create),
			multer().none(),
			validationMiddleware(ContractTemplateCreateSchema, 'body'),
			this.contractTemplateController.addContractTemplate,
		); //Add Contract Template (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(ContractTemplateStatusUpdateSchema, 'body'),
			this.contractTemplateController.updateContractTemplateStatus,
		); // Update Contract Template Status (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multer().none(),
			validationMiddleware(ContractTemplateUpdateSchema, 'body'),
			this.contractTemplateController.updateContractTemplate,
		); // Update Contract Template By Contract Template Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplate, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contractTemplateController.deleteContractTemplate,
		); // Delete Contract Template (Private)
	}
}

export default ContractTemplateRoutes;
