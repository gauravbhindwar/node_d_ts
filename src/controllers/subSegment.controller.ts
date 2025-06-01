import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import SubSegmentRepo from '@/repository/subSegment.repository';
import generalResponse from '@/utils/generalResponse';

class SubSegmentController {
	private SubSegmentService = new SubSegmentRepo();
	private msg = new MessageFormation('Sub Segment').message;

	public findAllSubSegment = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.SubSegmentService.getAllSubSegmentService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getSubSegmentData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.SubSegmentService.getSubSegmentDataService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findSubSegmentById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.SubSegmentService.getSubSegmentByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findSubSegmentBySlug = catchAsync(async (req: Request, res: Response) => {
		const slug = req.params.slug;
		const responseData = await this.SubSegmentService.getSubSegmentBySlugService(slug);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add SubSegment Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addSubSegment = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.SubSegmentService.addSubSegmentService({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update SubSegment Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateSubSegment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.SubSegmentService.updateSubSegmentService({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public updateSubSegmentStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.SubSegmentService.updateSubSegmentStatus({
			body: req.body,
			id: +id,
			user: req.user as User
		});

		return generalResponse(
			req,
			res,
			responseData,
			responseData.isActive ? 'Sub-Segment Activated Successfully' : 'Sub-Segment Archived Successfully',
			'success',
			true,
		);
	});

	/**
	 * Delete SubSegment Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteSubSegment = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.SubSegmentService.deleteSubSegmentService({
			id: Number(id),
			user: req.user as User
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default SubSegmentController;
