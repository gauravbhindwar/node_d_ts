import Joi from 'joi';
import { errorMessage } from '../constants/index.constants';
import { joiCommon } from './common.validation';

export const customArray = Joi.extend({
	type: 'array',
	base: Joi.array(),
	coerce: {
		from: 'string',
		method(value): any {
			if (typeof value !== 'string') {
				return;
			}

			try {
				if (value.trim() === '') {
					return { value: [] };
				}

				return { value: JSON.parse(value) };
			} catch (ignoreErr) {}
		},
	},
});

export const customObject = Joi.extend({
	type: 'object',
	base: Joi.object(),
	coerce: {
		from: 'string',
		method(value): any {
			if (typeof value !== 'string') {
				return;
			}

			try {
				if (value.trim() === '') {
					return { value: {} };
				}

				return { value: JSON.parse(value) };
			} catch (ignoreErr) {}
		},
	},
});

export const paginationValidataion = Joi.object({
	page: Joi.number()
		.allow('')
		.label('Page')
		.messages({ ...errorMessage }),
	limit: Joi.number()
		.allow('')
		.label('Limit')
		.messages({ ...errorMessage }),
	search: Joi.string()
		.allow('')
		.label('Search')
		.messages({ ...errorMessage }),
	id: Joi.number()
		.allow('')
		.label('Id')
		.messages({ ...errorMessage }),
	view: joiCommon.joiBoolean,
}).options({
	abortEarly: false,
});
