import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/user.model';
import HolidayTypeMasterRepo from '@/repository/holidayTypeMaster.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class HolidayTypeMaster {
	private HolidayTypeMasterRequest = new HolidayTypeMasterRepo();
	private msg = new MessageFormation('HolidayTypeMaster').message;

	/**
	 * Create Bonus Type Master Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public applyHolidayTypeMasterRequest = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.HolidayTypeMasterRequest.addHolidayTypeMaster(req.body, req.user as User);
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
	public getAllHolidayTypes = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.HolidayTypeMasterRequest.getAllHolidayTypes(req.query, req.user as User);
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
	public getHolidayType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.HolidayTypeMasterRequest.getHolidayType(req.params, req.query, req.user as User);
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
	public updateHolidayType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.HolidayTypeMasterRequest.updateHolidayType(req.params, req.body, req.user as User);
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
	public deleteHolidayType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.HolidayTypeMasterRequest.deleteHolidayType(req.params, req.query, req.user as User);
			return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

}

export default HolidayTypeMaster;
