import Joi from 'joi';

export const MedicalTypeCreateSchema = Joi.object({
	name: Joi.string().trim().label('Name').required(),
	format: Joi.string().trim().label('Format').required(),
	daysBeforeExpiry: Joi.number().allow('', null).label('Days Before Expiry'),
	daysExpiry: Joi.number().allow('', null).label('Days Expiry'),
	amount: Joi.number().allow('', null).label('Amount'),
	chargeable: Joi.string().valid('yes', 'no').label('Chargeable').optional().allow(null)
}).options({
	abortEarly: false,
});

export const MedicalTypeUpdateSchema = Joi.object({
	index: Joi.number().label('Index'),
	name: Joi.string().trim().label('Name'),
	format: Joi.string().trim().label('Format'),
	daysBeforeExpiry: Joi.number().allow('', null).label('Days Before Expiry'),
	daysExpiry: Joi.number().allow('', null).label('Days Expiry'),
	amount: Joi.number().allow('', null).label('Amount'),
	chargeable: Joi.string().valid('yes', 'no').label('Chargeable').optional().allow(null)
}).options({
	abortEarly: false,
});
