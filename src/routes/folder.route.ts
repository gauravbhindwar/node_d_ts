import FolderController from '@/controllers/folder.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { FolderCreateSchema, FolderUpdateSchema } from '@/validationSchema/folder.validation';
import { Router } from 'express';

class FolderRoute implements Routes {
	public path = '/folder';
	public router = Router();
	public FolderController = new FolderController();
	constructor() {
		this.initializeRoutes();
	}
	
	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.View),
			this.FolderController.findAllFolders,
		); //Get All Folders (Private)

		this.router.get(`${this.path}/get-folder-data`, authMiddleware, this.FolderController.getFolderData); //Get Folders Data (Public)

		this.router.get(
			`${this.path}/get-file-count/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.View),
			this.FolderController.findFileCount,
		);

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.FolderController.findFolderById,
		); //Get Folder by Id (Private)

		this.router.get(
			`${this.path}/get-all-files/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.FolderController.findFilesByFolderId,
		);

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.Create),
			validationMiddleware(FolderCreateSchema, 'body'),
			this.FolderController.addFolder,
		); // Add Folder (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(FolderUpdateSchema, 'body'),
			this.FolderController.updateFolder,
		); //Update Folder (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Folder, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.FolderController.deleteFolder,
		); // Delete Folder (Private)
	}
}

export default FolderRoute;
