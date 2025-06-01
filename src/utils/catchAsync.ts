import { messageStatus } from '@/interfaces/model/message.interface';
import { status } from '@/interfaces/model/user.interface';
import ErrorLogsRepo from '@/repository/errorLog.repository';
import { NextFunction, Request, Response } from 'express';
import { unAuthRoute } from './common.util';

const errorRepository = new ErrorLogsRepo();
export const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
	Promise.resolve(fn(req, res, next)).catch((err) => {
		const data = req?.url?.split(/[s/]+/).filter((part) => part !== '');
		if (!unAuthRoute.includes(data[0])) {
			dataItem(data[0], err, req?.user, req.headers.clientid);
		}
		next(err);
	});
};

async function dataItem(data: string, err, user, clientId) {
	await errorRepository.addErrorLogs({
		body: {
			type: data,
			status: messageStatus.ERROR,
			isActive: status.ACTIVE,
			full_error: JSON.stringify(err),
			error_message: err.message,
			createdBy: user.id ? user.id : null,
			email: user.loginUserData.email,
			clientId: clientId,
		},
    user
	});
}
