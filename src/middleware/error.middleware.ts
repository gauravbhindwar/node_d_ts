import { NextFunction, Request, Response } from 'express';

// ======================================================
import { AxiosError } from 'axios';
import { HttpException } from '../exceptions/HttpException';
// =================== packages ====================
import generalResponse from '../utils/generalResponse';
import { logger } from '../utils/logger';

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
	try {
		if (error instanceof HttpException) {
			const status: number = error.status || 500;
			const message: string = error.message || 'Something went wrong!';
			const data: any = error.data || {};
			logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
			return generalResponse(req, res, data, message, 'error', error.toast, status);
		}
		// axios Error
		else if (error instanceof AxiosError) {
			return generalResponse(
				req,
				res,
				{
					code: error.code,
					detailError: error.response?.data,
				},
				error.response?.data,
				'error',
				false,
				error.response?.status || 500,
			);
		} else if (error instanceof Error) {
			return generalResponse(req, res, error, error.message, 'error', true, 400);
		}
	} catch (err) {
		next(err);
	}
	return true;
};

// // if the Promise is rejected this will catch it
process.on('unhandledRejection', (error) => {
	logger.log('info', 'Unhandled Rejection', error);
	// throw error;
});

process.on('uncaughtException', (error) => {
	logger.log('info', 'Uncaught Exception', error);
});

export default errorMiddleware;
