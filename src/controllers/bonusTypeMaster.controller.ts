import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/user.model';
import BonusTypeMasterRepo from '@/repository/bonusTypeMaster.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class BonusTypeMaster {
	private BonusTypeMasterRequest = new BonusTypeMasterRepo();
	private msg = new MessageFormation('BonusTypeMaster').message;

	/**
	 * Create Bonus Type Master Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public applyBonusTypeMasterRequest = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.BonusTypeMasterRequest.addBonusTypeMaster(req.body, req.user as User);
			return generalResponse(req, res, responseData, this.msg.create, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	/**
	 * get Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public getAllBonusTypes = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.BonusTypeMasterRequest.getAllBonusTypes(req.query, req.user as User);
			return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
		} catch (error) {
			console.log('error', error);
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	/**
	 * get Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public getBonusType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.BonusTypeMasterRequest.getBonusType(req.params, req.query, req.user as User);
      return generalResponse(req, res, responseData, "Bonus Type Fetched Successfully", 'success', false);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	/**
	 * Update Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateBonusType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.BonusTypeMasterRequest.updateBonusType(req.params, req.body, req.user as User);
			return generalResponse(req, res, responseData, this.msg.update, 'success', true);
		} catch (error) {
      const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	/**
	 * Update Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteBonusType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.BonusTypeMasterRequest.daleteBonusType(req.params, req.query, req.user as User);
			return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

}

export default BonusTypeMaster;
