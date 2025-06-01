import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ContractTemplateRepo from '@/repository/contractTemplete.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class ContractTemplateController {
	private ContractTemplateService = new ContractTemplateRepo();
	private msg = new MessageFormation('Contract Template').message;

	/**
	 * Get Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllContractTemplate = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateService.getAllContractTemplateService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getContractTemplateData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateService.getContractTemplateDataService();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findContractTemplateServiceById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateService.getContractTemplateByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findContractTemplateServiceByRotationData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateService.getContractTemplateServiceByRotationDataService();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addContractTemplate = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContractTemplateService.addContractTemplate({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateContractTemplateStatus = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateService.updateContractTemplateStatus({
			body: req.body,
			id: +id,
		});
		return generalResponse(
			req,
			res,
			responseData,
			responseData.isActive === true
				? 'Contract Template Activated Successfully'
				: 'Contract Template Archived Successfully',
			'success',
			true,
		);
	});

	public updateContractTemplate = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateService.updateContractTemplate({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Contract Template Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteContractTemplate = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContractTemplateService.deleteContractTemplateService({
			id: Number(id),
      user: req.user as User
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default ContractTemplateController;
