import Joi from "joi";

export const holidayTypeMasterSchema = Joi.object({
  name: Joi.string().label("Name").allow(null),
  code: Joi.string().label("Code").allow(null),
  label: Joi.string().label("Label").allow(null),
  description: Joi.string().label("Description").allow("", null),
  slug: Joi.string().label("Slug").optional(),
}).options({
  abortEarly: false,
});

export const holidayTypeIdMasterSchema = Joi.object({
  id: Joi.number().label("Id").required(),
}).options({
  abortEarly: false,
});
