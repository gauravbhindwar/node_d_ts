import { status } from 'interfaces/model/user.interface';
import Joi from 'joi';
import { errorMessage } from '../constants/index.constants';
import { commonFiles } from './all.common.validation';
import { formObj, joiCommon } from './common.validation';

const commonObj = formObj(commonFiles.user);

const passwordRegEx = '^(?=.*[a-z])(?=.*[A-Z])*';

export const userDataValidate = Joi.object({
	...commonObj,
	name: Joi.string().trim().required(),
	email: Joi.string().email().label('Email').required(),
	timezone: Joi.string().label('Timezone').required(),
	profile: Joi.any(),
	status: joiCommon.joiString.valid('ACTIVE', 'INACTIVE').default(status.INACTIVE),
	roleId: Joi.number().label('Role Id').required(),
	permissions: Joi.array().items(Joi.number()),
	isMailNotification: Joi.boolean().label('Email Notification'),
	clientId: Joi.number().label("Client Id").optional().allow(null),
	segmentId: Joi.number().label("Segment Id").optional().allow(null),
}).options({
	abortEarly: false,
});

export const updateUserDataValidate = Joi.object({
	...commonObj,
	password: Joi.string()
		.min(6)
		.pattern(new RegExp(passwordRegEx))
		.label('Password')
		.messages({
			...errorMessage,
		}),
	timezone: Joi.string(),
	status: joiCommon.joiString.valid('ACTIVE', 'INACTIVE'),
	profile: Joi.any(),
	roleId: Joi.number().label('Role Id'),
	permissions: Joi.array().items(Joi.number()),
	isMailNotification: Joi.boolean().label('Email Notification'),
	clientId: Joi.number().label("Client Id").optional().allow(null),
	segmentId: Joi.number().label("Segment Id").optional().allow(null),
}).options({
	abortEarly: false,
});

export const updateUserValidate = Joi.object({
	...commonObj,
	status: joiCommon.joiString.valid('ACTIVE', 'INACTIVE'),
	profile: Joi.any(),
}).options({
	abortEarly: false,
});

export const updateProfile = Joi.object({
	...commonObj,
	position: Joi.string().allow(''),
	skills: Joi.string().allow(''),
	notificationPreference: Joi.boolean().default(false),
	verified: Joi.boolean(),
	profile: Joi.any(),
	status: joiCommon.joiString.valid('ACTIVE', 'INACTIVE').default(status.ACTIVE),
}).options({
	abortEarly: false,
});

export const changeUserDataValidate = Joi.object({
	client: Joi.array().items(Joi.number()),
}).options({
	abortEarly: false,
});

export const userSegmentDataValidate = Joi.object({
	type: Joi.string().valid('SEGMENT', 'SEGMENTAPPROVAL').required(),
	segment: Joi.array().items(Joi.string()).required(),
	segmentApproval: Joi.array().items(Joi.string()).required(),
}).options({
	abortEarly: false,
});

export const removeUserSegmentDataValidate = Joi.object({
	type: Joi.string().valid('SEGMENT', 'SEGMENTAPPROVAL').required(),
}).options({
	abortEarly: false,
});
