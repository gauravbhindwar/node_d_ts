import Joi from 'joi';

export const RequestTypeCreateSchema = Joi.object({
	name: Joi.string().trim().label('Name').required(),
	notificationEmails: Joi.array()
		.items(
			Joi.string()
				.email()
				.messages({ 'string.email': '{#label} must contain a valid Email' })
				.label('Notification Email'),
		)
		.required(),
	isActive: Joi.boolean().label('isActive').default(true),
}).options({
	abortEarly: false,
});

export const RequestTypeUpdateSchema = Joi.object({
	name: Joi.string().trim().label('Name'),
	notificationEmails: Joi.array().items(
		Joi.string()
			.email()
			.messages({ 'string.email': '{#label} must contain a valid Email' })
			.label('Notification Email'),
	),
	isActive: Joi.boolean(),
}).options({
	abortEarly: false,
});

export const RequestTypeStatusUpdateSchema = Joi.object({
	isActive: Joi.boolean().required(),
}).options({
	abortEarly: false,
});
