import Joi from 'joi';

export const TransportRequestVehicleCreateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	requestId: Joi.number().label('Request ID').required(),
	vehicleId: Joi.number().label('Vehicle ID').required(),
	driverId: Joi.number().label('Driver ID').required(),
	startDate: Joi.string().label('Start Date').required(),
	endDate: Joi.string().label('End Date').required(),
}).options({
	abortEarly: false,
});

export const TransportRequestVehicleUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID'),
	requestId: Joi.number().label('Request ID'),
	vehicleId: Joi.number().label('Vehicle ID'),
	driverId: Joi.number().label('Driver ID'),
	startDate: Joi.string().label('Start Date').required(),
	endDate: Joi.string().label('End Date').required(),
}).options({
	abortEarly: false,
});
