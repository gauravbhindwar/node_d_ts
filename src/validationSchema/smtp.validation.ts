import Joi from 'joi';
import { joiCommon } from './common.validation';

export const SmtpDataValidate = Joi.object({
	host: joiCommon.joiString.required(),
	port: Joi.number().valid(25, 465, 587, 2525).required(),
	username: joiCommon.joiString.required(),
	password: joiCommon.joiString.required(),
	isDefault: joiCommon.joiBoolean.required(),
	secure: joiCommon.joiBoolean.required(),
}).options({
	abortEarly: false,
});

export const updateSmtpDataValidate = Joi.object({
	host: joiCommon.joiString.required(),
	port: joiCommon.joiNumber.required(),
	username: joiCommon.joiString.required(),
	password: joiCommon.joiString.required(),
	isDefault: joiCommon.joiBoolean.required(),
	secure: joiCommon.joiBoolean.required(),
}).options({
	abortEarly: false,
});
