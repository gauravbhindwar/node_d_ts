import Joi from 'joi';
import { joiCommon } from './common.validation';

export const paramsIdSchema = Joi.object({
	clientId: joiCommon.joiNumber.required(),
	employeeId: joiCommon.joiNumber.required(),
}).options({
	abortEarly: false,
});
