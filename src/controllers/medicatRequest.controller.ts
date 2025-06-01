import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import MedicalRequestRepo from '@/repository/medicalRequest.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class MedicalRequestController {
	private MedicalRequestService = new MedicalRequestRepo();
	private msg = new MessageFormation('Medical Request').message;

	public findAllMedicalRequests = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalRequestService.getAllMedicalRequests(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findAllMedicalExpiryRequests = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalRequestService.getAllMedicalExpiryRequests(req.query,req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});


	public findMedicalRequestById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MedicalRequestService.getMedicalRequestById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addMedicalRequest = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalRequestService.addMedicalRequest({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateMedicalRequestStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MedicalRequestService.updateMedicalRequestStatus({
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});
}
export default MedicalRequestController;
