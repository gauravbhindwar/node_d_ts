import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/user.model';
import LeaveTypeMasterRepo from '@/repository/leaveTypeMaster.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class LeaveTypeMaster {
	private LeaveTypeMasterRequest = new LeaveTypeMasterRepo();
	private msg = new MessageFormation('LeaveTypeMaster').message;

	/**
	 * Create Leave Type Master Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public applyLeaveTypeMasterRequest = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.LeaveTypeMasterRequest.addLeaveTypeMaster(req.body, req.user as User);
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
	public getAllLeaveTypes = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.LeaveTypeMasterRequest.getAllLeaveTypes(req.query, req.user as User);
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
	public getLeaveType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.LeaveTypeMasterRequest.getLeaveType(req.params, req.query, req.user as User);
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
	public updateLeaveType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.LeaveTypeMasterRequest.updateLeaveType(req.params, req.body, req.user as User);
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
	public deleteLeaveType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.LeaveTypeMasterRequest.deleteLeaveType(req.params, req.user as User);
			return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

}

export default LeaveTypeMaster;
