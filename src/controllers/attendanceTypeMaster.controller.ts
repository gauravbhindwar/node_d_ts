import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import User from '@/models/user.model';
import AttendanceTypeMasterRepo from '@/repository/attendanceTypeMaster.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class AttendanceTypeMaster {
	private AttendanceTypeMasterRequest = new AttendanceTypeMasterRepo();
	private msg = new MessageFormation('Attendance Type').message;

	public applyAttendanceTypeMasterRequest = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AttendanceTypeMasterRequest.addAttendanceType(req.body, req.user as User);
			return generalResponse(req, res, responseData, this.msg.create, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	
	public getAllAttendanceTypes = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AttendanceTypeMasterRequest.getAllAttendanceTypes(req.query, req.user as User);
			return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
		} catch (error) {
			console.log('error', error);
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	
	public getAttendanceType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AttendanceTypeMasterRequest.getAttendanceType(req.params, req.query, req.user as User);
      return generalResponse(req, res, responseData, "Bonus Type Fetched Successfully", 'success', false);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	
	public updateAttendanceType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AttendanceTypeMasterRequest.updateAttendanceType(req.params, req.body, req.user as User);
			return generalResponse(req, res, responseData, this.msg.update, 'success', true);
		} catch (error) {
      const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

	
	public deleteAttendanceType = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AttendanceTypeMasterRequest.deleteAttendanceType(req.params, req.user as User);
			return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
		} catch (error) {
			const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
		}
	});

}

export default AttendanceTypeMaster;
