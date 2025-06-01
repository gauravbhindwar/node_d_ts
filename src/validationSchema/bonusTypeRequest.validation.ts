import Joi from "joi";

export const bonusTypeMasterSchema = Joi.object({
    name: Joi.string().label("Name").allow(null),
    code: Joi.string().label("Code").allow(null),
    // employee_type: Joi.string().label("Employee Type").valid("ALL", "RESIDENT", "ROTATION").allow(""),
    bonus_type: Joi.string().label("Bonus Type").valid("HOURLY", "RELIQUAT").allow(""),
    description: Joi.string().label("Description").allow("", null),
    slug: Joi.string().label("Slug").optional(),
}).options({
    abortEarly: false,
});

export const bonusTypeIdMasterSchema = Joi.object({
    id: Joi.number().label("Id").required(),
}).options({
    abortEarly: false,
});
