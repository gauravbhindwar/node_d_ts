import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportCommonRepo from '@/repository/transport.common.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
class TransportCommonController {
	private TransportCommonService = new TransportCommonRepo();
	private msg = new MessageFormation('Transport').message;
	private customMsg = new MessageFormation('TransportModel');

	public getAllCommonTransport = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCommonService.getAllCommonTransport(req.query);
		return generalResponse(
			req,
			res,
			responseData,
			this.customMsg.custom(`${responseData.type} fetched successfully`),
			'success',
			false,
		);
	});

	public getTransportData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCommonService.getTransportData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getCommonTransportById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const type = req.params.type;

		const responseData = await this.TransportCommonService.getCommonTransportById(+id, String(type));
		return generalResponse(
			req,
			res,
			responseData,
			this.customMsg.custom(`${type} fetched successfully`),
			'success',
			false,
		);
	});

	public addCommonTransport = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCommonService.addCommonTransport({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(
			req,
			res,
			responseData,
			this.customMsg.custom(`${req.body.type} created successfully`),
			'success',
			true,
		);
	});

	public updateCommonTransport = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportCommonService.updateCommonTransport({
			body: req.body,
			user: req.user as User,
			id: +id,
		});

		return generalResponse(
			req,
			res,
			responseData,
			this.customMsg.custom(`${req.body.type} updated successfully`),
			'success',
			true,
		);
	});

	public deleteCommonTransport = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const type = req.params.type;

		const responseData = await this.TransportCommonService.deleteCommonTransport(+id, type, req.user as User,);
		return generalResponse(
			req,
			res,
			responseData,
			this.customMsg.custom(`${type} deleted successfully`),
			'success',
			true,
		);
	});
}

export default TransportCommonController;
