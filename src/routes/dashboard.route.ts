import DashboardController from '@/controllers/dashboard.controller';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';

import { Router } from 'express';

class DashboardRoute implements Routes {
	public path = '/dashboard';
	public router = Router();
	public DashboardController = new DashboardController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, authMiddleware, this.DashboardController.getAllDashboardData); //Get all Dashboard Data

		this.router.get(`${this.path}/employee-data`, authMiddleware, this.DashboardController.getAllEmployeeData); //Get all Employee Data

		this.router.get(`${this.path}/transport-data`, authMiddleware, this.DashboardController.getAllTransportData); //Get all Transport Data

		this.router.get(`${this.path}/user-accounts`, authMiddleware, this.DashboardController.getAllUserAccountsData); //Get all User Account Data
	

		  // Created On Sep 26, 2024 
		  this.router.get(`${this.path}/employee-data-new`, authMiddleware, this.DashboardController.getAllEmployeeDataNew);

		  this.router.get(`${this.path}/client-data-new`, authMiddleware, this.DashboardController.getAllClientDataNew);

		  this.router.get(`${this.path}/contract-data-new`, authMiddleware, this.DashboardController.getAllContractDataNew);

		  this.router.get(`${this.path}/request-data-new`, authMiddleware, this.DashboardController.getAllRequestDateNew);
          this.router.get(`${this.path}/requests-data`, authMiddleware, this.DashboardController.requestData);
		  this.router.get(`${this.path}/medical-request-data-new`, authMiddleware, this.DashboardController.getMedicalRequestData);
		  this.router.get(`${this.path}/medical-type`, authMiddleware, this.DashboardController.getMedicalRequestList);
		  this.router.get(`${this.path}/audit-logs`, authMiddleware, this.DashboardController.auditlogslist);
		  //
	}
}

export default DashboardRoute;
