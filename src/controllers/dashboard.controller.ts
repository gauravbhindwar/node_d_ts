import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import DashboardRepo from '@/repository/dashboard.repository';
import MedicalTypeRepo from '@/repository/medicalType.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
class DashboardController {
	private DashboardService = new DashboardRepo();
	public MedicalTypeService = new MedicalTypeRepo();
	private msg = new MessageFormation('Dashboard').message;
	private medicalmsg = new MessageFormation('MedicalType').message;
	private errormsg = new MessageFormation("error logs").message;

	public getAllDashboardData = catchAsync(async (req: Request, res: Response) => {
		const contractEndFilter = req.query.contractEndFilter;
		const responseData = await this.DashboardService.getAllDashboardData(
			req.query,
			+contractEndFilter,
			req.user as User,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllEmployeeData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllEmployeeData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllTransportData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllTransportData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllUserAccountsData = catchAsync(async (req: Request, res: Response) => {
		const clientId = req.query.clientId;
		const userAccountFilter = req.query.userAccountFilter;
		const responseData = await this.DashboardService.getAllUserAccountsData(+userAccountFilter, +clientId);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllEmployeeDataNew = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllEmployeeDataNew(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllClientDataNew = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllClientDataNew(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllContractDataNew = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllContractDataNew(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAllRequestDateNew = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getAllRequestDateNew(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public requestData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.requestData(
		  req.query,
		  req.user as User
		);
		return generalResponse(
		  req,
		  res,
		  responseData,
		  this.msg.fetch,
		  "success",
		  false
		);
	  });
	public getMedicalRequestData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.getMedicalRequestData(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getMedicalRequestList = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalTypeService.getAllMedicalTypes(req.query);
		return generalResponse(req, res, responseData, this.medicalmsg.fetch, 'success', false);
	});

	// public failedloginlist = catchAsync(async (req: Request, res: Response) => {
	// 	const responseData = await this.DashboardService.failedloginlist(req.query);
	// 	return generalResponse(
	// 	  req,
	// 	  res,
	// 	  responseData,
	// 	  this.errormsg.fetch,
	// 	  "success",
	// 	  false
	// 	);
	//   });
	
	  public auditlogslist = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.DashboardService.auditlogslist(req.query);
		return generalResponse(
		  req,
		  res,
		  responseData,
		  this.errormsg.fetch,
		  "success",
		  false
		);
	  });

	  
}

export default DashboardController;
