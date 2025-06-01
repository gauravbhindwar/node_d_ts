import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ReliquatPaymentRepo from '@/repository/reliquatPayment.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class ReliquatPaymentController {
	private ReliquatPaymentService = new ReliquatPaymentRepo();
	private msg = new MessageFormation('Reliquat Payment').message;

	public findAllReliquatPayments = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatPaymentService.getAllReliquatPayment(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findReliquatPaymentById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ReliquatPaymentService.getReliquatPaymentById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addReliquatPayment = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatPaymentService.addReliquatPayment({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateReliquatPayment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ReliquatPaymentService.updateReliquatPayment({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteReliquatPayment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const user = req.user as User;
		const responseData = await this.ReliquatPaymentService.deleteReliquatPayment(+id, user);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default ReliquatPaymentController;
