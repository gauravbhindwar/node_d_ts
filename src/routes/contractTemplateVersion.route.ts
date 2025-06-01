import ContractTemplateVersionController from '@/controllers/contractTemplateVersion.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';

import { ContractTemplateVersionCreateSchema } from '@/validationSchema/contractTemplateVersion.validation';
import { Router } from 'express';
import multer from 'multer';

class ContractTemplateVersionRoutes implements Routes {
	public path = '/contract-template-version';
	public router = Router();
	public contractTemplateVersionController = new ContractTemplateVersionController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.View),
			this.contractTemplateVersionController.findAllContractTemplateVersion,
		); // Get All Contract Template Version (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.Create),
			multer().none(),
			validationMiddleware(ContractTemplateVersionCreateSchema, 'body'),
			this.contractTemplateVersionController.addContractTemplateVersion,
		); //Add Contract Template Version (Private)
		this.router.get(
			`${this.path}/get-contract-template-version-data`,
			authMiddleware,
			this.contractTemplateVersionController.getContractTemplateVersionData,
		); // Get Contract Template Version Data (Public)

		this.router.get(
			`${this.path}/last-inserted-data`,
			authMiddleware,
			this.contractTemplateVersionController.findAllContractTemplateVersionLastInsertedData,
		); // Get All Segment
		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contractTemplateVersionController.findContractTemplateVersionServiceById,
		); // Get Contract Template Version By ID (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multer().none(),
			// validationMiddleware(ContractTemplateUpdateVersionSchema, 'body'),
			this.contractTemplateVersionController.updateContractTemplateVersion,
		); // Update Contract Template Version By Version Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contractTemplateVersionController.deleteContractTemplateVersion,
		); // Delete Contract Template Version (Private)

		this.router.post(
			`${this.path}/preview/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractTemplateVersion, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multer().none(),
			// validationMiddleware(ContractTemplateUpdateVersionSchema, 'body'),
			this.contractTemplateVersionController.previewContractTemplate,
		); // Update Contract Template Version By Version Id (Private)
	}
}

export default ContractTemplateVersionRoutes;
