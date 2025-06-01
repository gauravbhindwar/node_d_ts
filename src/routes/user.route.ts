import AuthController from '@/controllers/auth.controller';
import UserController from '@/controllers/users.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { resetForgotPasswordSchema, userValidateSchema } from '@/validationSchema/auth.validation';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	changeUserDataValidate,
	removeUserSegmentDataValidate,
	updateUserDataValidate,
	updateUserValidate,
	userDataValidate,
	userSegmentDataValidate,
} from '@/validationSchema/user.validation';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';

class UsersRoute implements Routes {
	public path = '/users';
	public router = Router();
	public userController = new UserController();
	public authController = new AuthController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.View),
			this.userController.getUsers,
		); // Get All Users (Private)

		this.router.get(
			`${this.path}/get-users-for-search-dropdown`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.View),
			this.userController.getUsersForSearchDropdown,
		); // Get All Users for Search Dropdown (Private)

		this.router.get(`${this.path}/get-user-by-role-name`, authMiddleware, this.userController.getUserByRole); // Get Users By ID

		this.router.get(`${this.path}/role-permission`, authMiddleware, this.userController.getUserRolePermission); // Get logged in user id

		this.router.post(`${this.path}/login-as-user`, authMiddleware, this.userController.loginAsUser); // Login As User

		this.router.post(
			`${this.path}/message-user`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SalaryMessage, PermissionEnum.Update),
			// validationMiddleware(paramsIdSchema, 'params'),
			this.userController.getMessageUserById,
		); // Get Users By ID (Private)
		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.userController.getUserById,
		); // Get Users By ID (Private)

		this.router.post(
			`${this.path}/send-link`,
			authMiddleware,
			validationMiddleware(userValidateSchema, 'body'),
			this.userController.sendLink,
		); // Send Password Update Link

		this.router.post(
			`${this.path}/set-password`,
			validationMiddleware(resetForgotPasswordSchema, 'body'),
			this.authController.resetPassword,
		); // Reset Password

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Create),
			multerInterceptorConfig('profile', [], 50 * 1024, userDataValidate, 'body').single('profile'),
			validationMiddleware(userDataValidate, 'body'),
			this.userController.addUser,
		); // Add User (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multerInterceptorConfig('profile', [], 50 * 1024, updateUserDataValidate, 'body').single('profile'),
			validationMiddleware(updateUserDataValidate, 'body'),
			this.userController.updateUserById,
		); // Update User By User Id (Private)

		this.router.put(
			`${this.path}/change-user-status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			this.userController.updateUserStatus,
		); // Change User Status (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.userController.deleteUser,
		); // Delete User (Private)

		this.router.put(
			`${this.path}`,
			authMiddleware,
			multerInterceptorConfig('profile', [], 50 * 1024, updateUserValidate, 'body').single('profile'),
			validationMiddleware(updateUserValidate, 'body'),
			this.userController.updateUser,
		); // Update User by Authentication user

		this.router.put(
			`${this.path}/update-user-client/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(changeUserDataValidate, 'body'),
			this.userController.updateUserLoginUserDataById,
		); // (Private)

		this.router.put(
			`${this.path}/update-user-segments/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(userSegmentDataValidate, 'body'),
			this.userController.updateUserSegmentDataById,
		); // (Private)

		this.router.delete(
			`${this.path}/remove-user-client/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			this.userController.removeUserClient,
		); // (Private)

		this.router.delete(
			`${this.path}/remove-user-segment/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Users, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(removeUserSegmentDataValidate, 'query'),
			this.userController.removeUserSegment,
		); // (Private)
	}
}

export default UsersRoute;
