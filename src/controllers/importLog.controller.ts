import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ImportLogRepo from '@/repository/importLog.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class ImportLogController {
	private ImportLogService = new ImportLogRepo();
	private msg = new MessageFormation('Import Log').message;

	/**
	 * Get Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllImportLogData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ImportLogService.findAllImportLogData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findImportLogItemsServiceById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ImportLogService.getImportLogItemsByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addImportEmployee = catchAsync(async (req: Request, res: Response) => {
		try {
			const image = req.file;
			const responseData = await this.ImportLogService.addImportEmployee({
				body: req.body,
				user: req.user as User,
				image: image,
			});
			return generalResponse(req, res, responseData, this.msg.create, 'success', true);
		} catch (error) {
			return generalResponse(req, res, error, error.message, 'error', true, 400);
		}
	});
}

export default ImportLogController;
