import Joi from 'joi';

export const EmployeeFileCreateSchema = Joi.object({
	folderId: Joi.number().label('Folder Id').required(),
	employeeId: Joi.number().label('Employee Id').required(),
	fileName: Joi.binary().label('File Name'),
	fileLink: Joi.boolean().default(false).label('File Link').allow('', null),
}).options({
	abortEarly: false,
});

export const EmployeeFileUpdateSchema = Joi.object({
	folderId: Joi.number().label('Folder Id').required(),
	newFileName: Joi.string().trim().label('New File Name'),
}).options({
	abortEarly: false,
});

export const EmployeeFileFetchAllSchema = Joi.object({
	employeeId: Joi.number().label('Employee Id').required(),
}).options({
	abortEarly: false,
});

export const EmployeeFilePathSchema = Joi.object({
	filename: Joi.string().label('Filename').required(),
}).options({
	abortEarly: false,
});
