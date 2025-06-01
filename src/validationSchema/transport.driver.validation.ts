import Joi from 'joi';
import { joiCommon } from './common.validation';

export const TransportDriverCreateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	driverNo: Joi.string().label('Driver No').required(),
	firstName: Joi.string().label('First Name').required(),
	lastName: Joi.string().label('Last Name').required(),
	positionId: Joi.number().label('Position ID').required(),
	companyStart: Joi.date().label('Company Start').required(),
	experienceStart: Joi.date().label('Experience Start').required(),
	utcexperienceStart: Joi.string().trim().optional().allow("", null),
	utccompanyStart: Joi.string().trim().optional().allow("", null)
});

export const TransportDriverUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	driverNo: Joi.string().label('Driver No'),
	firstName: Joi.string().label('First Name'),
	lastName: Joi.string().label('Last Name'),
	positionId: Joi.number().label('Position ID'),
	companyStart: Joi.date().label('Company Start'),
	experienceStart: Joi.date().label('Experience Start'),
	utcexperienceStart: Joi.string().trim().optional().allow("", null),
	utccompanyStart: Joi.string().trim().optional().allow("", null)
});

export const paramsAvailableDriverSchema = Joi.object({
	clientId: joiCommon.joiNumber.required(),
	startDate: Joi.string().label('Start Date'),
	endDate: Joi.string().label('End Date'),
});
