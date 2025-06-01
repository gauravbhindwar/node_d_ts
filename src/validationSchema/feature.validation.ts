import Joi from 'joi';

export const FeatureCreateSchema = Joi.object({
	name: Joi.string().label('Feature Name').required(),
	permission: Joi.array().items(Joi.string()).label('Permission'),
}).options({
	abortEarly: false,
});

export const FeatureUpdateSchema = Joi.object({
	name: Joi.string().label('Feature Name'),
	permission: Joi.array().items(Joi.string()).label('Permission'),
}).options({
	abortEarly: false,
});
