import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ApproveDeletedFileRepo from '@/repository/approveDeletedFile.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class ApproveDeletedFileController {
	private ApproveDeletedFileService = new ApproveDeletedFileRepo();
	private msg = new MessageFormation('Approve Deleted File').message;

	/**
	 * Get Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllApproveDeletedFile = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ApproveDeletedFileService.getAllApproveDeletedFileService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Delete Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteApproveDeletedFile = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ApproveDeletedFileService.deleteApproveDeletedFileService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});

	public restoreApproveDeletedFile = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ApproveDeletedFileService.restoreApproveDeletedFileService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});
}

export default ApproveDeletedFileController;
