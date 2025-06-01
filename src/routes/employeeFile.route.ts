import EmployeeFileController from '@/controllers/employeeFile.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	EmployeeFileCreateSchema,
	EmployeeFileFetchAllSchema,
	EmployeeFilePathSchema,
	EmployeeFileUpdateSchema,
} from '@/validationSchema/employeeFile.validation';
import { Router } from 'express';

class EmployeeFileRoutes implements Routes {
	public path = '/employee-file';
	public router = Router();
	public employeeFileController = new EmployeeFileController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeFile, PermissionEnum.View),
			validationMiddleware(EmployeeFileFetchAllSchema, 'query'),
			this.employeeFileController.findAllEmployeeFile,
		); // Get All Employee File

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeFile, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeFileController.findEmployeeFileById,
		); // Get Employee File By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeFile, PermissionEnum.Create),
			multerInterceptorConfig('employeeRelatedFiles', [], 50 * 1024, EmployeeFileCreateSchema, 'body').single(
				'fileName',
			),
			validationMiddleware(EmployeeFileCreateSchema, 'body'),
			this.employeeFileController.addEmployeeFile,
		); //Add Employee File (Private)

		this.router.post(
			`${this.path}/generate-file-path`,
			authMiddleware,
			validationMiddleware(EmployeeFilePathSchema, 'body'),
			this.employeeFileController.getEmployeeFilePath,
		); //Get Employee File Path (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeFile, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(EmployeeFileUpdateSchema, 'body'),
			this.employeeFileController.updateEmployeeFile,
		); // Update Employee File By Employee File Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeFile, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeFileController.deleteEmployeeFile,
		); // Delete Employee File (Private)
	}
}

export default EmployeeFileRoutes;
