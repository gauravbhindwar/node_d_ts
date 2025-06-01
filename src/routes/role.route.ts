import RoleController from '@/controllers/role.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { RoleCreateSchema, RoleUpdateSchema } from '@/validationSchema/role.validation';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';

class RoleRoute implements Routes {
	public path = '/role';
	public router = Router();
	public roleController = new RoleController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Role, PermissionEnum.View),
			this.roleController.findAllRole,
		); // Get All Role (Private)

		this.router.get(`${this.path}/get-role-data`, authMiddleware, this.roleController.getRoleData); // Get Role Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			validationMiddleware(paramsIdSchema, 'params'),
			this.roleController.findRoleById,
		); // Get Role By Id (Public)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Role, PermissionEnum.Create),
			validationMiddleware(RoleCreateSchema, 'body'),
			this.roleController.addRole,
		); // Add Role (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Role, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(RoleUpdateSchema, 'body'),
			this.roleController.updateRole,
		); // Update Role (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Role, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.roleController.deleteRole,
		); // Delete Role (Private)
	}
}

export default RoleRoute;
