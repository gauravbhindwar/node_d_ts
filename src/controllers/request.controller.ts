import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import RequestRepo from '@/repository/request.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class RequestController {
	private RequestService = new RequestRepo();
	private msg = new MessageFormation('Request').message;

	public getAllRequest = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RequestService.getAllRequest(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getRequestById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.RequestService.getRequestById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addRequest = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RequestService.addRequest({
			body: req.body,
			user: req.user as User,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RequestService.updateRequestStatus({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', false);
	});

	public deleteRequest = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.RequestService.deleteRequest(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default RequestController;
