import Joi from 'joi';
import { joiCommon } from './common.validation';

export const TransportCommonCreateSchema = Joi.object({
	name: Joi.string().trim().label('Name').required(),
	clientId: Joi.number().label('Client Id').required(),
	type: Joi.string().trim().label('Type').required(),
}).options({
	abortEarly: false,
});

export const TransportCommonUpdateSchema = Joi.object({
	name: Joi.string().trim().label('Name'),
	type: Joi.string().trim().label('Type').required(),
	clientId: Joi.number().label('Client Id').required(),
}).options({
	abortEarly: false,
});

export const paramsIdTypeSchema = Joi.object({
	id: joiCommon.joiNumber.required(),
	type: joiCommon.joiString.required(),
});
