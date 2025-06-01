import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportVehicleRepo from '@/repository/transport.vehicle.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportCapacityController {
	private TransportVehicleService = new TransportVehicleRepo();
	private msg = new MessageFormation('TransportVehicle').message;

	public getAllTransportVehicle = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportVehicleService.getAllTransportVehicle(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAvailableTransportVehicles = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportVehicleService.getAvailableTransportVehicles(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportVehicleById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportVehicleService.getTransportVehicleById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportVehicle = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportVehicleService.addTransportVehicle({
			body: req.body,
			user: req.user as User,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportVehicle = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportVehicleService.updateTransportVehicle({
			body: req.body,
			user: req.user as User,
			id: +id,
		});

		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportVehicle = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportVehicleService.deleteTransportVehicle(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default TransportCapacityController;
