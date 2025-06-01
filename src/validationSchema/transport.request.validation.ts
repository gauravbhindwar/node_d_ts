import { transportStatus } from '@/interfaces/model/transport.request.interface';
import Joi from 'joi';
import { joiCommon } from './common.validation';

export const TransportRequestCreateSchema = Joi.object({
	clientId: Joi.number().label('Client ID').required(),
	source: Joi.string().label('Source').required(),
	startDate: Joi.date().label('Start Date').required(),
	destination: Joi.string().label('Source').required(),
	destinationDate: Joi.date().label('Start Date').required(),
	utcstartDate: Joi.string().trim().optional().allow("", null),
	utcdestinationDate: Joi.string().trim().optional().allow("", null),
	status: joiCommon.joiString.valid('DRAFT', 'STARTED', 'INPROGRESS', 'COMPLETED').default(transportStatus.DRAFT),
}).options({
	abortEarly: false,
});

export const TransportRequestUpdateSchema = Joi.object({
	clientId: Joi.number().label('Client ID'),
	source: Joi.string().label('Source'),
	startDate: Joi.date().label('Start Date'),
	destination: Joi.string().label('Source'),
	destinationDate: Joi.date().label('Start Date'),
	utcstartDate: Joi.string().trim().optional().allow("", null),
	utcdestinationDate: Joi.string().trim().optional().allow("", null),
	status: joiCommon.joiString.valid('DRAFT', 'STARTED', 'INPROGRESS', 'COMPLETED'),
}).options({
	abortEarly: false,
});
