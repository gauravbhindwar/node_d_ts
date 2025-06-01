import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import FeatureRepo from '@/repository/feature.repository';
import generalResponse from '@/utils/generalResponse';

class FeatureController {
	private FeatureService = new FeatureRepo();
	private msg = new MessageFormation('Feature').message;

	public findAllFeature = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.FeatureService.getAllFeatureService();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findFeatureById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FeatureService.getFeatureByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Feature Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addFeature = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.FeatureService.addFeatureService({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Feature Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateFeature = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FeatureService.updateFeatureService({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Feature Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteFeature = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FeatureService.deleteFeatureService({
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default FeatureController;
