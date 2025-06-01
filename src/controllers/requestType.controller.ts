import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import RequestTypeRepo from '@/repository/requestType.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class RequestTypeController {
	private RequestTypeService = new RequestTypeRepo();
	private msg = new MessageFormation('RequestType').message;

	public findAllRequestTypes = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RequestTypeService.getAllRequestType(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getRequestTypes = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RequestTypeService.getRequestTypeData();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findRequestTypeById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.RequestTypeService.getRequestTypeById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addRequestType = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RequestTypeService.addRequestType({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateRequestTypeStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RequestTypeService.updateRequestTypeStatus({
			body: req.body,
			id: +id,
      user: req.user as User
		});
		return generalResponse(
			req,
			res,
			responseData,
			responseData.isActive === true ? 'Request Type Activated Successfully' : 'Request Type Archived Successfully',
			'success',
			true,
		);
	});

	public updateRequestType = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RequestTypeService.updateRequestType({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteRequestType = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RequestTypeService.deleteRequestType(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default RequestTypeController;
