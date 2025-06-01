import ClientController from '@/controllers/client.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { multerInterceptorConfig } from '@/utils/multerConfig';
import { ClientCreateSchema, ClientStatusUpdateSchema, ClientUpdateSchema } from '@/validationSchema/client.validation';
import { paramsIdSchema, paramsSlugSchema } from '@/validationSchema/common.validation';
import { Router } from 'express';

class ClientsRoute implements Routes {
	public path = '/clients';
	public router = Router();
	public clientController = new ClientController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.View),
			this.clientController.findAllClient,
		); // Get All Client (Private)

		this.router.get(
			`${this.path}/get-clients-for-search-dropdown`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.View),
			this.clientController.findAllClientForSearchDropdown,
		); // Get All Client For Search Dropdown (Private)

		this.router.get(`${this.path}/get-client-data`, authMiddleware, this.clientController.getClientData); // Get Client Dropdown Data (Public)

		this.router.get(`${this.path}/get_sub_client_list/:id`, authMiddleware,validationMiddleware(paramsIdSchema, 'params'),
		this.clientController.getSubClientData); // Get Sub Client Dropdown Data (Public)

		this.router.get(
			`${this.path}/get-all-fonction`,
			authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
			this.clientController.findClientFonction,
		);

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.clientController.findClientById,
		); // Get Client By ID (Private)

		this.router.get(
			`${this.path}/get-slug-data/:slug`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.View),
			validationMiddleware(paramsSlugSchema, 'params'),
			this.clientController.findClientBySlug,
		); // Get Client By Slug (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.Create),
			multerInterceptorConfig('logo', [], 50 * 1024, ClientCreateSchema, 'body').fields([
				{ name: 'logo' },
				{ name: 'stampLogo' },
			]),
			validationMiddleware(ClientCreateSchema, 'body'),
			this.clientController.addClient,
		); //Add Client (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(ClientStatusUpdateSchema, 'body'),
			this.clientController.updateClientStatus,
		); // Update Client Status (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multerInterceptorConfig('logo', [], 50 * 1024, ClientCreateSchema, 'body').fields([
				{ name: 'logo' },
				{ name: 'stampLogo' },
			]),
			validationMiddleware(ClientUpdateSchema, 'body'),
			this.clientController.updateClient,
		); // Update Client By Client Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Client, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.clientController.deleteClient,
		); // Delete Client (Private)


		this.router.post(
			`${this.path}/update_client_leaves/:id`,
			// authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.LeaveType, PermissionEnum.Create),
			// validationMiddleware(paramsIdSchema, 'params'),
			// validationMiddleware(ClientLeaveUpdateSchema, 'body'),
			this.clientController.updateClientLeaves
		)

		this.router.get(
			`${this.path}/get_client_leaves/:id`,
			// authMiddleware,
			// rolePermissionMiddleware(FeaturesNameEnum.LeaveType, PermissionEnum.View),
			this.clientController.getClientLeavesData
		)
	}
}

export default ClientsRoute;
