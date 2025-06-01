import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportRequestRepo from '@/repository/transport.request.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportRequestController {
	private TransportRequestService = new TransportRequestRepo();
	private msg = new MessageFormation('TransportRequest').message;

	public getAllTransportRequest = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportRequestService.getAllTransportRequest(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportRequestById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportRequestService.getTransportRequestById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportRequest = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportRequestService.addTransportRequest({
			body: req.body,
			user: req.user as User,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportRequest = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportRequestService.updateTransportRequest({
			body: req.body,
			user: req.user as User,
			id: +id,
		});

		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportRequest = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportRequestService.deleteTransportRequest(+id,req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default TransportRequestController;
