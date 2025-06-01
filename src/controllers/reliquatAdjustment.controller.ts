import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ReliquatAdjustmentRepo from '@/repository/reliquatAdjustment.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class ReliquatAdjustmentController {
	private ReliquatAdjustmentService = new ReliquatAdjustmentRepo();
	private msg = new MessageFormation('Reliquat Adjustment').message;

	public findAllReliquatAdjustments = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatAdjustmentService.getAllReliquatAdjustment(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findReliquatAdjustmentById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ReliquatAdjustmentService.getReliquatAdjustmentById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addReliquatAdjustment = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatAdjustmentService.addReliquatAdjustment({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateReliquatAdjustment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ReliquatAdjustmentService.updateReliquatAdjustment({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteReliquatAdjustment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const user = req.user as User;
		const responseData = await this.ReliquatAdjustmentService.deleteReliquatAdjustment(+id, user);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default ReliquatAdjustmentController;
