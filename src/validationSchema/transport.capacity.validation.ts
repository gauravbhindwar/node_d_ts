import Joi from 'joi';
import { joiCommon } from './common.validation';

export const TransportCapacityCreateSchema = Joi.object({
	value: Joi.number().label('Value').required(),
	clientId: Joi.number().label('Client Id').required(),
}).options({
	abortEarly: false,
});

export const TransportCapacityUpdateSchema = Joi.object({
	value: Joi.number().label('Value'),
	clientId: Joi.number().label('Client Id').required(),
}).options({
	abortEarly: false,
});

export const paramsIdTypeSchema = Joi.object({
	id: joiCommon.joiNumber.required(),
	type: joiCommon.joiString.required(),
});
