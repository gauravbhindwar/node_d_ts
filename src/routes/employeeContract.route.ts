import EmployeeContractController from '@/controllers/employeeContract.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { uploadSignedContract } from '@/middleware/upload';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	EmployeeContractCreateSchema,
	EmployeeContractFetchAllSchema,
	EmployeeContractUpdateSchema,
	EndEmployeeContractUpdateSchema,
} from '@/validationSchema/employeeContract.validation';
import { Router } from 'express';
import multer from 'multer';

class EmployeeContractRoutes implements Routes {
	public path = '/employee-contract';
	public router = Router();
	public employeeContractController = new EmployeeContractController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.View),
			validationMiddleware(EmployeeContractFetchAllSchema, 'query'),
			this.employeeContractController.findAllEmployeeContract,
		); // Get All Employee Contract (Private)

		//
		this.router.get(
			`${this.path}/employee-contract-end`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractEnd, PermissionEnum.View),
			this.employeeContractController.findAllEmployeeContractEnd,
		); // (Private)

		this.router.get(
			`${this.path}/get-contract-number`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.View),
			this.employeeContractController.getEmployeeContractNumber,
		); // Get Next Contract Number (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeContractController.findEmployeeContractServiceById,
		); // Get Employee Contract By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.Create),
			multer().none(),
			validationMiddleware(EmployeeContractCreateSchema, 'body'),
			this.employeeContractController.addEmployeeContract,
		); //Add Employee Contract (Private)

		this.router.put(
			`${this.path}/update-contract-end`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.ContractEnd, PermissionEnum.Update),
			validationMiddleware(EndEmployeeContractUpdateSchema, 'body'),
			// multer().none(),
			this.employeeContractController.updateEmployeeContractEnd,
		);

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multer().none(),
			validationMiddleware(EmployeeContractUpdateSchema, 'body'),
			this.employeeContractController.updateEmployeeContract,
		); // Update Employee Contract By Employee Contract Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeContractController.deleteEmployeeContract,
		); // Delete Employee Contract (Private)

		this.router.post(
  `${this.path}/:id/upload-signed`,
  authMiddleware,
  rolePermissionMiddleware(FeaturesNameEnum.EmployeeContract, PermissionEnum.Update),
  validationMiddleware(paramsIdSchema, 'params'),
  uploadSignedContract, // ✅ just use it directly
  this.employeeContractController.uploadSignedContract,
); //
	}
}

export default EmployeeContractRoutes;
