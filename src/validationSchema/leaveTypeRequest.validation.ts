import Joi from "joi";

export const leaveTypeMasterSchema = Joi.object({
    name: Joi.string().label("Name").allow(null),
    code: Joi.string().label("Code").allow(null),
    // employee_type: Joi.string().label("Employee Type").valid("ALL","RESIDENT", "ROTATION"),
    payment_type: Joi.string().label("Payment Type").allow(null),
    description: Joi.string().label("Description").allow(null),
    slug: Joi.string().label("Slug").optional(),
}).options({
    abortEarly: false,
});

export const leaveTypeIdMasterSchema = Joi.object({
    id: Joi.number().label("Id").required(),
}).options({
    abortEarly: false,
});
