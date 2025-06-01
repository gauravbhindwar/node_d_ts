import Joi from 'joi';

export const TransportVehicleDocumentCreateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	vehicleId: Joi.number().label('Vehicle ID').required(),
	folderId: Joi.number().label('Folder ID'),
	documentName: Joi.any().label('Document Name'),
	documentPath: Joi.any().label('Document Path'),
	issueDate: Joi.date().label('Issue Date'),
	expiryDate: Joi.date().label('Issue Date'),
}).options({
	abortEarly: false,
});

export const TransportVehicleDocumentUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID'),
	vehicleId: Joi.number().label('Vehicle ID'),
	folderId: Joi.number().label('Folder ID'),
	documentName: Joi.any().label('Document Name'),
	documentPath: Joi.any().label('Document Path'),
	issueDate: Joi.date().label('Issue Date'),
	expiryDate: Joi.date().label('Issue Date'),
}).options({
	abortEarly: false,
});
