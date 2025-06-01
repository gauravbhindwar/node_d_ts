import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportDriverRepo from '@/repository/transport.driver.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportDriverController {
	private TransportDriverService = new TransportDriverRepo();
	private msg = new MessageFormation('TransportDriver').message;

	public getAllTransportDriver = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportDriverService.getAllTransportDriver(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getAvailableTransportDriver = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportDriverService.getAvailableTransportDriver(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportDriverById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportDriverService.getTransportDriverById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportDriver = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportDriverService.addTransportDriver({
			body: req.body,
			user: req.user as User,
		});

		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportDriver = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportDriverService.updateTransportDriver({
			body: req.body,
			user: req.user as User,
			id: +id,
		});

		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportDriver = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportDriverService.deleteTransportDriver(+id,req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default TransportDriverController;
