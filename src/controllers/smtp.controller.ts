import { Request, Response } from 'express';

import { MessageFormation } from 'constants/messages.constants';
import { checkParamId } from 'helpers/common.helper';
import { QueryParser } from 'helpers/queryParser/query.parser';
import Smtp from 'models/smtp.model';
import User from 'models/user.model';
import SmtpRepo from 'repository/smtp.repository';
import { parse } from 'utils/common.util';
import { catchAsync } from '../utils/catchAsync';
import generalResponse from '../utils/generalResponse';
class SmtpController {
	private SmtpService = new SmtpRepo();
	private msg = new MessageFormation('Smtp').message;

	/**
	 * get Smtp Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public getSmtpDetails = catchAsync(async (req: Request, res: Response) => {
		const parsedQuery = new QueryParser({ request: req, model: Smtp }).getFullQuery();
		let responseData = await this.SmtpService.getAllData({
			where: { ...parsedQuery.where },
			limit: parsedQuery.limit,
			order: parsedQuery.order,
			offset: parsedQuery.offset,
			attributes: parsedQuery.attributes,
		});
		responseData = parse(responseData);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Smtp pages Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public addSmtp = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.SmtpService.addSmtpService({ body: req.body, _user: req.user as User });
		return generalResponse(req, res, responseData.data, responseData.message, 'success', true);
	});

	/**
	 * update Smtp Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public updateSmtp = catchAsync(async (req: Request, res: Response) => {
		const { params } = req;
		checkParamId(params.id as string, 'Smtp Id');

		const responseData = await this.SmtpService.updateSmtpService({
			body: req.body,
			id: +params.id,
		});
		return generalResponse(req, res, responseData.data, responseData.message, 'success', true);
	});

	/**
	 * delete Smtp APi
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteSmtp = catchAsync(async (req: Request, res: Response) => {
		const smtpId = checkParamId(req.params.id, 'SMTP Id');
		const deleteSmtpData = await this.SmtpService.deleteSmtp(smtpId);
		return generalResponse(req, res, deleteSmtpData, this.msg.delete, 'success', true);
	});
}

export default SmtpController;
