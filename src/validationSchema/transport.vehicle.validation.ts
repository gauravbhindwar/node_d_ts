import Joi from 'joi';

export const TransportVehicleCreateSchema = Joi.object({
	vehicleNo: Joi.string().trim().label('Vehicle Number').required(),
	year: Joi.number().min(1000).max(9999).label('Year').required().messages({
		'number.min': `{#label} must be a 4 digits`,
		'number.max': `{#label} must be a 4 digits`,
	}),
	typeId: Joi.number().label('Type ID').required(),
	modelId: Joi.number().label('Model ID').required(),
	capacity: Joi.array().items(Joi.string().label('Capacity')).required(),
	clientId: Joi.number().label('Client ID').required(),
}).options({
	abortEarly: false,
});

export const TransportVehicleUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	vehicleNo: Joi.string().trim().label('Vehicle Number'),
	year: Joi.number().min(1000).max(9999).label('Year').messages({
		'number.min': `{#label} must be a 4 digits`,
		'number.max': `{#label} must be a 4 digits`,
	}),
	typeId: Joi.number().label('Type ID'),
	modelId: Joi.number().label('Model ID'),
	capacity: Joi.array().items(Joi.string().label('Capacity')),
}).options({
	abortEarly: false,
});
