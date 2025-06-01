import Joi from 'joi';
// ================ Import Packages ==========
import _ from 'lodash';
import { errorMessage } from '../constants/index.constants';

const passwordRegEx = '^(?=.*[a-z])(?=.*[A-Z])*';

export const joiCommon = {
	joiString: Joi.string()
		.trim()
		.messages({ ...errorMessage }),
	joiNumber: Joi.number().messages({ ...errorMessage }),
	joiBoolean: Joi.boolean().messages({ ...errorMessage }),
	joiDate: Joi.date()
		.iso()
		.messages({ ...errorMessage }),
	joiArray: Joi.array().messages({ ...errorMessage }),
	joiObject: Joi.object().messages({ ...errorMessage }),
	// ==============For Pagination=======================
	joiPage: Joi.number()
		.messages({ ...errorMessage })
		.allow('', null),
	joiLimit: Joi.number().messages({ ...errorMessage }),
	joiFields: Joi.string()
		.messages({ ...errorMessage })
		.allow('', null),
	joiExclude: Joi.string()
		.messages({ ...errorMessage })
		.allow('', null),
	joiSort: Joi.object().messages({ ...errorMessage }),
	joiEmail: Joi.string()
		.messages({ ...errorMessage, 'string.email': '{#label} must be a valid email' })
		.email()
		.trim()
		.lowercase()
		.options({ convert: true }),
};

export const commonValidation = {
	passwordCommon: Joi.string()
		.min(6)
		.required()
		.pattern(new RegExp(passwordRegEx))
		.messages({
			...errorMessage,
		}),
	no: Joi.string()
		.required()
		.pattern(new RegExp('^[0-9]{9,10}$'))
		.label('Phone Number')
		.messages({ ...errorMessage, 'string.pattern.base': `{#label} must be number 9 or 10 digit` }),
	code: Joi.string()
		.required()
		.pattern(new RegExp('^([0|+[0-9]{1,5})$'))
		.label('Country Code')
		.messages({ ...errorMessage, 'string.pattern.base': `Please enter valid country code` }),
	pageContent: Joi.array().items(
		Joi.object({
			title: joiCommon.joiString.required(),
			description: joiCommon.joiString.required(),
			title_ar: joiCommon.joiString,
			description_ar: joiCommon.joiString,
		}),
	),
};

export const email = Joi.string()
	.email()
	.label('Email')
	.required()
	.messages({ ...errorMessage, 'string.email': `{#label} must be a valid email` });

export const Email_OR_Phone = Joi.alternatives()
	.try(
		Joi.string()
			.email()
			.label('Email')
			.required()
			.messages({ ...errorMessage, 'string.email': `{#label} must be a valid email` }),
		Joi.object({
			code: commonValidation.code,
			no: commonValidation.no,
		})
			.required()
			.messages({ ...errorMessage }),
	)
	.label('Email/Phone')
	.required();

export const paramsIdSchema = Joi.object({
	id: joiCommon.joiNumber.required(),
}).options({
	abortEarly: false,
});

export const paramsSlugSchema = Joi.object({
	slug: Joi.required(),
}).options({
	abortEarly: false,
});

export const querySchema = Joi.object({
	toast: joiCommon.joiBoolean,
}).options({
	allowUnknown: true,
	abortEarly: false,
});

export const joiCommonAddress = {
	address1: joiCommon.joiString.label('Address1').allow('', null),
	address2: joiCommon.joiString.label('Address2').allow('', null),
	city: joiCommon.joiString.label('City').allow('', null),
	state: joiCommon.joiString.label('State').allow('', null),
	country: joiCommon.joiString.label('Country').allow('', null),
	zip: joiCommon.joiString.label('Postal code').allow('', null),
};

export const formObj = (stringValidationFields: object) => {
	const data = {};
	Object.entries(stringValidationFields || {}).forEach((entry) => {
		const [key, value] = entry;
		if (key.includes('ar')) key.replace('ar', 'Arabic');
		let validators: Joi.StringSchema<string> | Joi.NumberSchema<number>;
		if (value.number) validators = joiCommon.joiNumber.label(`${_.startCase(key.replace(/ /g, '_'))}`);
		else validators = joiCommon.joiString.label(`${_.startCase(key.replace(/ /g, '_'))}`);
		if (value.allow) validators = validators.allow(...value.allow);
		if (value.require) validators = validators.required();
		if (value.max) validators = validators.max(value.max);
		data[key] = validators;
		return;
	});
	return data;
};

export const phoneNumber = Joi.object({
	code: commonValidation.code,
	no: commonValidation.no,
})
	.required()
	.messages({ ...errorMessage });

export const paginationValidation = {
	page: Joi.number().label('Page'),
	limit: Joi.number().label('Limit'),
};
