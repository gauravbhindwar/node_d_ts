import Joi from "joi";

export const FolderCreateSchema = Joi.object({
  name: Joi.string().trim().label("Name").required(),
  index: Joi.number().label("Index").optional().allow(null),
  typeId: Joi.number().label("Type Id").required(),
}).options({
  abortEarly: false,
});

export const FolderUpdateSchema = Joi.object({
  name: Joi.string().trim().label("Name"),
  index: Joi.number().label("Index").optional().allow(null),
  typeId: Joi.number().label("Type Id"),
});
