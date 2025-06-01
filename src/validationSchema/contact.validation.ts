import Joi from 'joi';
import { joiCommon } from './common.validation';

export const ContactCreateSchema = Joi.object({
	name: Joi.string().trim().label('Name').required(),
	email: Joi.string().email().trim().label('Email').optional().allow("", null),
	// address1: Joi.string().trim().label('Address-1').required(),
	// address2: Joi.string().trim().allow('', null).label('Address-2'),
	// address3: Joi.string().trim().allow('', null).label('Address-3'),
	// address4: Joi.string().trim().allow('', null).label('Address-4'),
	// city: Joi.string().trim().label('City').required(),
	// region: Joi.string().trim().label('Region').required(),
	// postalCode: joiCommon.joiNumber.min(100000).max(999999).allow('', null).label('Postal Code').messages({
	// 	'number.min': `{#label} must be a 6 digits`,
	// 	'number.max': `{#label} must be a 6 digits`,
	// }),
	// country: Joi.string().trim().label('Country').required(),
	// dueDateDays: Joi.number().allow('', null).label('Due Date Days'),
	// brandingTheme: Joi.string().trim().allow('', null).label('Branding Theme'),
	
	clientId: Joi.number().label('Client Id').required(),
}).options({
	abortEarly: false,
});

export const ContactUpdateSchema = Joi.object({
	name: Joi.string().trim().label('Name'),
	email: Joi.string().email().trim().label('Email').optional().allow("", null),
	address1: Joi.string().trim().label('Address-1'),
	address2: Joi.string().trim().allow('', null).label('Address-2'),
	address3: Joi.string().trim().allow('', null).label('Address-3'),
	address4: Joi.string().trim().allow('', null).label('Address-4'),
	city: Joi.string().trim().label('City'),
	region: Joi.string().trim().label('Region'),
	postalCode: joiCommon.joiNumber.min(100000).max(999999).allow('', null).label('Postal Code').messages({
		'number.min': `{#label} must be a 6 digits`,
		'number.max': `{#label} must be a 6 digits`,
	}),
	country: Joi.string().trim().label('Country'),
	dueDateDays: Joi.number().allow('', null).label('Due Date Days'),
	brandingTheme: Joi.string().trim().allow('', null).label('Branding Theme'),
}).options({
	abortEarly: false,
});
