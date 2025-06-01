import Joi from 'joi';

export const ContractTemplateCreateSchema = Joi.object({
	contractName: Joi.string().trim().label('Contract Name').required(),
	clientId: Joi.number().label('Client Id').required(),
	isActive: Joi.boolean().default(true),
}).options({
	abortEarly: false,
});

export const ContractTemplateUpdateSchema = Joi.object({
	contractName: Joi.string().trim().label('Contract Name').required(),
	clientId: Joi.number().label('Client Id').required(),
	isActive: Joi.boolean(),
}).options({
	abortEarly: false,
});

export const ContractTemplateStatusUpdateSchema = Joi.object({
	isActive: Joi.boolean().required(),
}).options({
	abortEarly: false,
});
