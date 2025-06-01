import Joi from 'joi';

export const TransportDriverDocumentCreateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	driverId: Joi.number().label('Driver ID').required(),
	folderId: Joi.number().label('Folder ID'),
	documentName: Joi.any().label('Document Name'),
	documentPath: Joi.any().label('Document Path'),
	issueDate: Joi.date().label('Issue Date'),
	expiryDate: Joi.date().label('Issue Date'),
}).options({
	abortEarly: false,
});

export const TransportDriverDocumentUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID'),
	driverId: Joi.number().label('Driver ID'),
	folderId: Joi.number().label('Folder ID'),
	documentName: Joi.any().label('Document Name'),
	documentPath: Joi.any().label('Document Path'),
	issueDate: Joi.date().label('Issue Date'),
	expiryDate: Joi.date().label('Issue Date'),
}).options({
	abortEarly: false,
});
