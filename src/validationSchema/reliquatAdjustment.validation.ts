import Joi from 'joi';

export const ReliquatAdjustmentCreateSchema = Joi.object({
	clientId: Joi.number().label('Client Id').required(),
	employeeId: Joi.number().label('Employee Id').required(),
	startDate: Joi.string().label('Start Date').required(),
	utcstartDate: Joi.string().label('Start Date').optional().allow("", null),
	adjustment: Joi.number().label('Adjustment').required(),
}).options({
	abortEarly: false,
});

export const ReliquatAdjustmentUpdateSchema = Joi.object({
	startDate: Joi.string().label('Start Date').required(),
	utcstartDate: Joi.string().label('Start Date').optional().allow("", null),
	adjustment: Joi.number().label('Adjustment').required(),
}).options({
	abortEarly: false,
});
