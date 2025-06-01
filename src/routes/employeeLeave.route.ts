import EmployeeLeaveController from '@/controllers/employeeLeave.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { EmployeeLeaveCreateSchema } from '@/validationSchema/employeeLeave.validation';
import { Router } from 'express';

class EmployeeLeaveRoute implements Routes {
	public path = '/employee-leave';
	public router = Router();
	public employeeLeaveController = new EmployeeLeaveController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.View),
			this.employeeLeaveController.findAllEmployeeLeaveTypes,
		); // Get All Employee Leave (Private)

		this.router.get(
			`${this.path}/pdf-data/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeLeaveController.findEmployeeLeavePdfData,
		); // (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeLeaveController.findEmployeeLeaveById,
		); // (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.Create),
			validationMiddleware(EmployeeLeaveCreateSchema, 'body'),
			this.employeeLeaveController.addEmployeeLeave,
		); // Add Employee Leave (Private)

		this.router.put(
			`${this.path}/updateLeave/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeLeaveController.updateEmployeeLeave,
		); 

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			this.employeeLeaveController.updateEmployeeLeaveStatus,
		); // Update Employee Leave Status (Private)

		this.router.get(
			`${this.path}/lastLeave/:employeeId`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.EmployeeLeave, PermissionEnum.Create),
			this.employeeLeaveController.findEmployeeLastLeaveByEmployeeId,
		); // (Private)
	}
}
export default EmployeeLeaveRoute;
