import Joi from "joi";

export const RotationCreateSchema = Joi.object({
  name: Joi.string().trim().label("Name").required(),
  weekOn: Joi.number().label("Week On").allow("", null),
  weekOff: Joi.number().label("Week Off").allow("", null),
  isResident: Joi.boolean().default(false),
  daysWorked: Joi.string().trim().allow("", null).label("Days Worked"),
  isAllDays: Joi.boolean().default(false),
  isWeekendBonus: Joi.boolean().default(false),
  isOvertimeBonus: Joi.boolean().default(false),
  country: Joi.string().trim().label("Country").optional().allow("", null),
  annualHolidays: Joi.number().label("Annual Holidays").allow("", null),
  overtimeBonusType: Joi.string()
    .trim()
    .label("Over-time Bonus Type")
	.valid('DAILY', 'NIGHT', 'HOLIDAY')
    .optional()
    .allow("", null),
  overtimeHours: Joi.number()
    .label("Over-time Hours")
    .optional()
    .allow("", null),
}).options({
  abortEarly: false,
});

export const RotationUpdateSchema = Joi.object({
  name: Joi.string().trim().label("Name"),
  weekOn: Joi.number().label("Week On").allow("", null),
  weekOff: Joi.number().label("Week Off").allow("", null),
  isResident: Joi.boolean(),
  daysWorked: Joi.string().trim().allow("", null).label("Days Worked"),
  isAllDays: Joi.boolean(),
  isWeekendBonus: Joi.boolean(),
  isOvertimeBonus: Joi.boolean(),
  country: Joi.string().trim().label("Country").optional().allow("", null),
  annualHolidays: Joi.number()
    .label("Annual Holidays")
    .optional()
    .allow("", null),
  overtimeBonusType: Joi.string()
    .trim()
    .label("Over-time Bonus Type")
	.valid('DAILY', 'NIGHT', 'HOLIDAY')
    .optional()
    .allow("", null),
  overtimeHours: Joi.number()
    .label("Over-time Hours")
    .optional()
    .allow("", null),
}).options({
  abortEarly: false,
});
