import { messageStatus } from '@/interfaces/model/errorLogs.interface';
import Joi from 'joi';
import { joiCommon } from './common.validation';

export const MessageCreateSchema = Joi.object({
	message: Joi.string().label('Message').required(),
	salaryMonth: Joi.string().label('salaryMonth').optional(),
	messageId: Joi.number().label('Message Id').allow(''),
	employeeId: Joi.array().items(Joi.number().label('employeeId')).allow('', null),
	segmentId: Joi.array().items(Joi.number().label('segmentId')).allow('', null),
	messageSalary: Joi.array().items(Joi.object().unknown(true)).allow('', null).optional(),
	managerUserId: Joi.array().items(Joi.number().label('managerUserId')).allow('', null),
	clientId: Joi.number().label('Client').required(),
	status: joiCommon.joiString.valid('DRAFT', 'SENT', 'ERROR').default(messageStatus.DRAFT),
	isSchedule: Joi.boolean().default(false),
	scheduleDate: Joi.date().label('Date of Birth').allow('', null),
}).options({
	abortEarly: false,
});
export const MessageUpdateSchema = Joi.object({
	message: Joi.string().label('Message').required(),
	messageId: Joi.number().label('Message Id').allow(''),
  salaryMonth: Joi.string().label('salaryMonth').optional(),
  messageSalary: Joi.array().items(Joi.object().unknown(true)).allow('', null).optional(),
	employeeId: Joi.array().items(Joi.number().label('employeeId')).allow('', null),
	segmentId: Joi.array().items(Joi.number().label('segmentId')).allow('', null),
	managerUserId: Joi.array().items(Joi.number().label('managerUserId')).allow('', null),
	clientId: Joi.number().label('Client').required(),
	status: joiCommon.joiString.valid('DRAFT', 'SENT', 'ERROR').default(messageStatus.DRAFT),
	isSchedule: Joi.boolean().default(false),
	scheduleDate: Joi.date().label('Date of Birth').allow('', null),
}).options({
	abortEarly: false,
});
