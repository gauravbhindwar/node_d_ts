import Joi from 'joi';

export const ReliquatPaymentCreateSchema = Joi.object({
	clientId: Joi.number().label('Client Id').required(),
	employeeId: Joi.number().label('Employee Id').required(),
	startDate: Joi.string().label('Start Date').required(),
	utcstartDate: Joi.string().label('Start Date').optional().allow("", null),
	amount: Joi.number().label('Amount').required(),
}).options({
	abortEarly: false,
});

export const ReliquatPaymentUpdateSchema = Joi.object({
	startDate: Joi.string().label('Start Date').required(),
	utcstartDate: Joi.string().label('Start Date').optional().allow("", null),
	amount: Joi.number().label('Amount').required(),
}).options({
	abortEarly: false,
});
