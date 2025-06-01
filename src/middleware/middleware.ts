// =================== import packages ====================
import { RequestHandler } from 'express';
import { cleanObj } from '../helpers/common.helper';
import generalResponse from '../utils/generalResponse';
// =====================================================

interface Error {
	message: string;
	path: Object;
	type: string;
	context: any;
}

export const errorFilterValidator = (error: Array<Error>) => {
	const extractedErrors: Array<string> = [];
	error.forEach((err: Error) => extractedErrors.push(err.message));
	const errorResponse = extractedErrors.join(', ');
	return errorResponse;
};

const validationMiddleware = (type: any, value: 'body' | 'query' | 'params' = 'body'): RequestHandler => {
	return async (req: any, res, next) => {
		try {
			if (req?.file) {
				return next();
			}
			cleanObj(req[value]);
			req[value] = await type.validateAsync(req[value]);
			return next();
		} catch (e) {
			const error: any = e;
			if (error.details) {
				const errorResponse = errorFilterValidator(error.details);
				return generalResponse(req, res, null, errorResponse, 'error', true, 400);
			}
			return generalResponse(req, res, null, 'Something went wrong!', 'success', true, 400);
		}
	};
};

export default validationMiddleware;
