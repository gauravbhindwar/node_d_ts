import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ContractTemplateVersionRepo from '@/repository/contractTemplateVersion.repository';
import generalResponse from '@/utils/generalResponse';

class ContractTemplateVersionController {
	private ContractTemplateVersionService = new ContractTemplateVersionRepo();
	private msg = new MessageFormation('Contract Template Version').message;

	/**
	 * Get Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllContractTemplateVersion = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateVersionService.getAllContractTemplateVersionService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getContractTemplateVersionData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateVersionService.getContractTemplateVersionDataService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get Last Inserted Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public findAllContractTemplateVersionLastInsertedData = catchAsync(async (req: Request, res: Response) => {

		const responseData = await this.ContractTemplateVersionService.findAllContractTemplateVersionLastInsertedData(
			req.query,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public findContractTemplateVersionServiceById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateVersionService.getContractTemplateVersionByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addContractTemplateVersion = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateVersionService.addContractTemplateVersion({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateContractTemplateVersion = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateVersionService.updateContractTemplateVersion({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteContractTemplateVersion = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateVersionService.deleteContractTemplateVersionService({
			id: Number(id),
      user: req.user as User
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});

	/**
	 * Update Contract Template Version Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public previewContractTemplate = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateVersionService.previewContractTemplate({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});
}

export default ContractTemplateVersionController;
