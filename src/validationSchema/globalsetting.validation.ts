import * as Joi from 'joi';

// Define the validation schema for global_settings
export const GlobalSettingsSchema = Joi.object({
  timezone_utc: Joi.string().trim().label('Timezone UTC').required(),
  dateformat: Joi.string().trim().label('Date Format').required(),
  timeformat: Joi.string().trim().label('Time Format').required(),
  currency: Joi.string().trim().label('Currency').optional().allow("", null),
}).options({
  abortEarly: false,
});
