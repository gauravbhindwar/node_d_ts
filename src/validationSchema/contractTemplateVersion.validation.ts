import Joi from 'joi';

export const ContractTemplateVersionCreateSchema = Joi.object({
	contractTemplateId: Joi.number().label('Contract Template Id').required(),
	versionName: Joi.string().trim().allow('', null).label('Version Name'),
	description: Joi.string().trim().allow('', null).label('Description'),
	clientId: Joi.number().label('Client Id').allow('', null),
	isActive: Joi.boolean().default(true),
}).options({
	abortEarly: false,
});

export const ContractTemplateUpdateVersionSchema = Joi.object({
	versionName: Joi.string().trim().allow('', null).label('Version Name'),
	description: Joi.string().trim().allow('', null).label('Description'),
	isActive: Joi.boolean().default(true),
	clientId: Joi.number().label('Client Id').allow('', null),
	contractTemplateId: Joi.number().label('Contract Template Id').required(),
}).options({
	abortEarly: false,
});

export const ContractTemplateVersionFetchAllSchema = Joi.object({
	page: Joi.number().label('Page'),
	limit: Joi.number().label('Limit'),
	sort: Joi.string().label('Sort'),
	sortBy: Joi.string().label('SortBy').allow('', null),
	clientId: Joi.number().label('Client Id').allow('', null),
	contractTemplateId: Joi.number().label('Contract Template Id').required(),
}).options({
	abortEarly: false,
});
