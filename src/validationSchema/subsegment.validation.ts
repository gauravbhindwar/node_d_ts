import Joi from 'joi';

export const SubSegmentCreateSchema = Joi.object({
	code: Joi.string().trim().label('Code').required(),
	name: Joi.string().trim().label('Segment Name').required(),
	segmentId: Joi.number().label('Segment Id').required(),
	costCentre: Joi.string().trim().allow('', null).label('Cost Center'),
	fridayBonus: Joi.number().allow('', null).label('Friday Bonus'),
	saturdayBonus: Joi.number().allow('', null).label('Saturday Bonus'),
	overtime01Bonus: Joi.number().allow('', null).label('Overtime 01 bonus'),
	overtime02Bonus: Joi.number().allow('', null).label('Overtime 02 bonus'),
	isActive: Joi.boolean().default(true),
}).options({
	abortEarly: false,
});

export const SubSegmentUpdateSchema = Joi.object({
	code: Joi.string().trim().label('Code'),
	name: Joi.string().trim().label('Segment Name'),
	segmentId: Joi.number().label('Segment Id'),
	costCentre: Joi.string().trim().allow('', null).label('Cost Center'),
	fridayBonus: Joi.number().allow('', null).label('Friday Bonus'),
	saturdayBonus: Joi.number().allow('', null).label('Saturday Bonus'),
	overtime01Bonus: Joi.number().allow('', null).label('Overtime 01 bonus'),
	overtime02Bonus: Joi.number().allow('', null).label('Overtime 02 bonus'),
}).options({
	abortEarly: false,
});

export const SubSegmentFetchAllSchema = Joi.object({
	page: Joi.number().label('Page'),
	limit: Joi.number().label('Limit'),
	sort: Joi.string().label('Sort'),
	sortBy: Joi.string().label('SortBy').allow('', null),
	clientId: Joi.number().label('Client Id').allow('', null),
	segmentId: Joi.number().label('Segment Id').allow('', null),
	isActive: Joi.boolean().allow('', null),
}).options({
	abortEarly: false,
});

export const subSegmentStatusUpdateSchema = Joi.object({
	isActive: Joi.boolean().required(),
}).options({
	abortEarly: false,
});
