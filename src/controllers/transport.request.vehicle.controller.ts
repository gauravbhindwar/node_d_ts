import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportRequestVehicleRepo from '@/repository/transport.request.vehicle.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportRequestVehicleController {
	private TransportRequestVehicleService = new TransportRequestVehicleRepo();
	private msg = new MessageFormation('TransportRequestVehicle').message;

	public getAllTransportRequestVehicle = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportRequestVehicleService.getAllTransportRequestVehicle(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportRequestVehicleById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportRequestVehicleService.getTransportRequestVehicleById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportRequestVehicle = catchAsync(async (req: Request, res: Response) => {
		const startDate = req.body.startDate;
		const endDate = req.body.endDate;
		const responseData = await this.TransportRequestVehicleService.addTransportRequestVehicle({
			body: req.body,
			user: req.user as User,
			startDate,
			endDate,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportRequestVehicle = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const startDate = req.body.startDate;
		const endDate = req.body.endDate;

		const responseData = await this.TransportRequestVehicleService.updateTransportRequestVehicle({
			body: req.body,
			user: req.user as User,
			id: +id,
			startDate,
			endDate,
		});

		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportRequestVehicle = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportRequestVehicleService.deleteTransportRequestVehicle(+id, req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default TransportRequestVehicleController;
