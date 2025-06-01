import { MessageFormation } from '@/constants/messages.constants';
import ErrorLogsRepo from '@/repository/errorLog.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class ErrorLogsController {
	private ErrorLogsService = new ErrorLogsRepo();
	private msg = new MessageFormation('Error Logs').message;

	/**
	 * Get Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllErrorLogs = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ErrorLogsService.getAllErrorLogsService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findAllErrorLogsCategories = catchAsync(async (req: Request, res: Response) => {
		const id = req.query.clientId;
		const responseData = await this.ErrorLogsService.findAllErrorLogsCategories(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default ErrorLogsController;
