import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportCapacityRepo from '@/repository/transport.capacity.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportCapacityController {
	private TransportCapacityService = new TransportCapacityRepo();
	private msg = new MessageFormation('TransportCapacity').message;

	public getAllTransportCapacity = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCapacityService.getAllTransportCapacity(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportCapacityData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCapacityService.getTransportCapacityData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportCapacityById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportCapacityService.getTransportCapacityById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportCapacity = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportCapacityService.addTransportCapacity({
			body: req.body,
			user: req.user as User,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportCapacity = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportCapacityService.updateTransportCapacity({
			body: req.body,
			user: req.user as User,
			id: +id,
		});

		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportCapacity = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportCapacityService.deleteTransportCapacity(+id,req.user as User,);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default TransportCapacityController;
