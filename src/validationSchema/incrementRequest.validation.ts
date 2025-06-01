import Joi from "joi";

export const incrementAmountaddSchema = Joi.object({
    salaryIncrement: Joi.number().label("Salary Increase Amount").allow(null),
    bonusIncrement: Joi.number().label("Bonus Increase Amount").allow(null),
    salaryIncrementPercent: Joi.number().label("Salary Increase Percent").allow(null).optional(),
    bonusIncrementPercent: Joi.number().label("Bonus Increase Percent").allow(null).optional(),
    currentBonus: Joi.number().label("Current Bonus").allow(null).optional(),
    salaryDescription: Joi.string().label("Salary Description").allow("", null).optional(),
    bonusDescription: Joi.string().label("Bonus Description").allow("", null).optional(),
    clientId: Joi.number().label('Client Id').required(),
    employeeId: Joi.number().label('employee Id').required(),
    currentSalary: Joi.number().label("Current Salary").allow(null)
}).options({
    abortEarly: false,
});

export const incrementAmountParamsSchema = Joi.object({
    clientId: Joi.number().label('Client Id').required(),
}).options({
    abortEarly: false,
});

export const currentAmountParamsSchema = Joi.object({
  employeeId: Joi.number().label('Client Id').required(),
}).options({
    abortEarly: false,
});

export const incrementAmountStatusParamsSchema = Joi.object({
    id: Joi.number().label('Client Id').required(),
}).options({
    abortEarly: false,
});

export const incrementAmountStatusBodySchema = Joi.object({
    status: Joi.string().label('Status').valid("APPROVED", "REJECTED","PENDING").required(),
}).options({
    abortEarly: false,
});

export const incrementAmountDataBodySchema = Joi.object({
    salaryIncrement: Joi.number().label("Salary Increase Amount").allow(null),
    bonusIncrement: Joi.number().label("Bonus Increase Amount").allow(null),
    currentBonus: Joi.number().label("Current Bonus").allow(null).optional(),
    salaryIncrementPercent: Joi.number().label("Salary Increase Percent").allow(null).optional(),
    bonusIncrementPercent: Joi.number().label("Bonus Increase Percent").allow(null).optional(),
    salaryDescription: Joi.string().label("Salary Description").allow("", null).optional(),
    bonusDescription: Joi.string().label("Bonus Description").allow("", null).optional(),
    clientId: Joi.number().label('Client Id').optional(),
    employeeId: Joi.number().label('employee Id').optional(),
    currentSalary: Joi.number().label("Current Salary").allow(null)
}).options({
    abortEarly: false,
});


