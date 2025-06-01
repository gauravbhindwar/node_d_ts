import Joi from 'joi';
import { joiCommon } from './common.validation';

export const TimesheetFetchAllSchema = Joi.object({
	page: Joi.number().label('Page'),
	limit: Joi.number().label('Limit'),
	sort: Joi.string().label('Sort'),
	sortBy: Joi.string().label('SortBy').allow('', null),
	clientId: Joi.number().label('Client Id').required(),
	startDate: Joi.string().label('Start Date').required(),
	endDate: Joi.string().label('End Date').required(),
	activeTab: Joi.string().label('Active Tab').required(),
	subSegmentId: Joi.number().label('Sub Segment Id').allow(null, ''),
	segmentId: Joi.number().label('Segment Id').allow(null, ''),
	search: Joi.string().label('Search').allow('', null),
}).options({
	abortEarly: false,
});

export const TimesheetFetchDropdownSchema = Joi.object({
	startDate: Joi.string().label('Start Date').allow('', null),
	endDate: Joi.string().label('End Date').allow('', null),
}).options({
	abortEarly: false,
});

export const TimesheetParamsIdSchema = Joi.object({
	clientId: joiCommon.joiNumber.required(),
}).options({
	abortEarly: false,
});

export const TimesheetCreteBody = Joi.object({
	disabledFunction: Joi.array().items(Joi.string().label('Disabled Function')),
	employeeIds: Joi.array().items(Joi.number().label('Employee ids')),
}).options({
	abortEarly: false,
});

export const TimesheetBodyTimesheetIdSchema = Joi.object({
	timesheetIds: Joi.array().items(Joi.number().label('Timesheet ids')).required(),
	status: Joi.string().label('Status'),
}).options({
	abortEarly: false,
});

export const ReliquatDateSchema = Joi.object({
	type: Joi.string().label('Type').required(),
	employeeId: Joi.number().label('Employee Id').allow(null, ''),
}).options({
	abortEarly: false,
});
