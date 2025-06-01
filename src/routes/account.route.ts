import AccountController from '@/controllers/account.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { Router } from 'express';
import multer from 'multer';

class AccountRoute implements Routes {
	public path = '/account';
	public router = Router();
	public AccountController = new AccountController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
			this.AccountController.getAllAccountData,
		); // Get All Accounts (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
			this.AccountController.generateAccountData,
		); // Generate Account Data (Private)

		this.router.get(
			`${this.path}/account-by-id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
			this.AccountController.getAllAccountDataById,
		); // Get All Accounts (Private)

		this.router.put(
			`${this.path}/update-account`,
			authMiddleware,
			multer().none(),
			rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
			this.AccountController.updateAccountData,
		);
	}
}

export default AccountRoute;
