import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/user.model';
import IncreaseRequest from '@/repository/incrementRequest.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class IncrementRequest {
	private SalaryBonusReq = new IncreaseRequest();
	private msg = new MessageFormation('SalaryBonusIncrement').message;

	/**
	 * Create Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public applySalaryBonusReq = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.addSalaryBonusIncrement(req.body, req.user as User);
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
	public getAllSalaryBonusReq = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.getSalaryBonusIncrement(req.params, req.query, req.user as User);
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
	public getCurrentSalaryBonusData = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.getCurrentSalaryBonusData(req.params);
      return generalResponse(req, res, responseData, "Salary Bonus Fetched Successfully", 'success', false);
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
	public updateSalaryBonusReqStatus = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.updateIncrementRequestStatus(
				req.params,
				req.body,
				req.user as User,
			);
			return generalResponse(req, res, responseData, this.msg.update, 'success', true);
		} catch (error) {
			console.log('error', error);
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
	public updateSalaryBonusReqData = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.updateIncrementRequestData(req.params, req.body, req.user as User);
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
	public deleteSalaryBonusReqData = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.SalaryBonusReq.daleteIncrementRequestData(req.params, req.user as User);
			return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});
}

export default IncrementRequest;
