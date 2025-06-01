import XeroController from '@/controllers/xero.controller';
import XeroHelperObject from '@/helpers/xero.helper';
import xeroMiddleware from '@/middleware/xero.middleware';
// import xeroMiddleware from '@/middleware/xero.middleware';
import generalResponse from '@/utils/generalResponse';
import AuthController from 'controllers/auth.controller';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';

class XeroRoute implements Routes {
	public router = Router();
	public authController = new AuthController();
	public path = '/xero';
	public xeroController = new XeroController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}/callback`, XeroHelperObject.handleCallBack);

		this.router.get(`${this.path}/tester-get`, xeroMiddleware, async (req, res) => {
			try {
				const data = {};
				const brandingTheme = await XeroHelperObject.xero.accountingApi.getBrandingThemes(
					XeroHelperObject.activeTenantId,
				);
				await XeroHelperObject.xero.initialize();
				await XeroHelperObject.xero.updateTenants(false);
				data['brandingTheme'] = brandingTheme.body;
				data['tenents'] = await XeroHelperObject.xero.tenants;
				return generalResponse(req, res, data, 'response fetched successfully', 'success', true);
			} catch (error) {
				console.log('check error !!!', error);
			}
		});

		this.router.get(`${this.path}/getAllContact`, xeroMiddleware, async (req, res) => {
			try {
				const data = await XeroHelperObject.getAllContacts();
				return generalResponse(req, res, data, 'response fetched successfully', 'success', true);
			} catch (error) {
				return generalResponse(req, res, error, 'Something went wrong', 'Error', true);
			}
		});

		this.router.post(`${this.path}/migrate-employee`, xeroMiddleware, this.xeroController.migrateEmployees);

		this.router.post(`${this.path}/generateInvoice/:employeeId`, xeroMiddleware, this.xeroController.generateInvoice);
	}
}

export default XeroRoute;
