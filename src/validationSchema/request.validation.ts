import { collectionDelivery, status } from '@/interfaces/model/request.interface';
import Joi from 'joi';
import { joiCommon } from './common.validation';

export const RequestCreateSchema = Joi.object({
	name: Joi.string().label('Name').required(),
	contractNumber: [
		Joi.string().trim().label('Contract Number').allow('', null),
		Joi.number().label('Contract Number').allow('', null),
	],
	mobileNumber: Joi.number()
		.integer()
		.unsafe()
		.min(1000000)
		.max(999999999999999)
		.label('Mobile Number')
		.required()
		.messages({
			'number.base': 'Mobile number should be at least 7 digits.',
			'number.min': 'Mobile number should be at least 7 digits.',
			'number.max': 'Mobile number should be at most 15 digits.',
		}),
	email: Joi.string().email().label('Email').required(),
	emailDocuments: Joi.boolean().default(false),
	deliveryType: joiCommon.joiString.valid('COLLECTION', 'DELIVERY').default(collectionDelivery.COLLECTION),
	deliveryDate: Joi.date().label('Delivery Date').required(),
	utcdeliveryDate: Joi.string().trim().optional().allow("", null),
	requestDocument: Joi.array().items(
		Joi.object({
			documentType: Joi.number().label('Document Type'),
			otherInfo: Joi.string().allow('', null).label('Other Info'),
		}),
	),
}).options({
	abortEarly: false,
});

export const RequestStatusUpdateSchema = Joi.object({
	status: Joi.string().valid('STARTED', 'COMPLETED', 'DECLINED').label('Status'),
	requestDocumentId: Joi.when('status', {
		is: status.COMPLETED,
		then: Joi.array().items(Joi.number().label('Request Document Id')).required(),
		otherwise: Joi.forbidden(),
	}),
	documentStatus: Joi.when('status', {
		is: status.COMPLETED,
		then: Joi.string().valid('ACTIVE', 'DECLINED').label('Request Document Status').required(),
		otherwise: Joi.forbidden(),
	}),
}).options({
	abortEarly: false,
});
