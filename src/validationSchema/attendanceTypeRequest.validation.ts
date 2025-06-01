import Joi from "joi";

export const attendanceTypeMasterSchema = Joi.object({
    name: Joi.string().label("Name").allow(null),
    code: Joi.string().label("Code").allow(null),
    description: Joi.string().label("Description").allow(null),
    slug: Joi.string().label("Slug").optional(),
}).options({
    abortEarly: false,
});

export const attendanceTypeIdMasterSchema = Joi.object({
    id: Joi.number().label("Id").required(),
}).options({
    abortEarly: false,
});
