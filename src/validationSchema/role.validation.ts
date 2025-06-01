import Joi from "joi";

export const RoleCreateSchema = Joi.object({
  name: Joi.string().label("Role Name").required(),
  assignPermissions: Joi.array().items(Joi.number()).label('Assign Permissions'),
}).options({
  abortEarly: false,
});

export const RoleUpdateSchema = Joi.object({
  name: Joi.string().label("Role Name"),
  assignPermissions: Joi.array()
    .items(Joi.number())
    .label("Assign Permissions"),
}).options({
  abortEarly: false,
});
