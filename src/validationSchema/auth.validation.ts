import { status } from "interfaces/model/user.interface";
import Joi from "joi";
import { errorMessage } from "../constants/index.constants";
import { commonFiles } from "./all.common.validation";
import { commonValidation, formObj, joiCommon } from "./common.validation";

//=============== Register Validation Schema ===============
export const registerSchema = Joi.object().keys({
  email: Joi.string().allow("").required(),
  phoneNumber: Joi.object({
    code: commonValidation.code.allow(""),
    no: commonValidation.no.allow(""),
  })
    .required()
    .messages({ ...errorMessage }),
  name: Joi.string()
    .min(2)
    .required()
    .label("Name")
    .messages({ ...errorMessage }),
  notification_token: Joi.string().label("Device token"),
  password: commonValidation.passwordCommon.label("Password"),
  birthDate: joiCommon.joiString.allow(""),
});

export const loginSchema = Joi.object({
  email: Joi.string().allow("").required(),
  password: commonValidation.passwordCommon.label("Password"),
  // recaptcha: Joi.string().allow('').required().label('Recaptcha'),
  notificationToken: Joi.string().label("Device token"),
}).options({
  abortEarly: false,
});

const commonObj = formObj(commonFiles.user);

export const register = Joi.object({
  ...commonObj,
  role: joiCommon.joiString.valid("STUDENT", "TEACHER", "ADMIN").required(),
  enrollNumber: Joi.when("role", {
    is: "STUDENT",
    then: joiCommon.joiNumber.max(16).min(16).required(),
  }),
  education: Joi.string().allow(""),
  phone: Joi.number().allow(""),
  zipCode: Joi.number().allow(""),
  about: Joi.string().allow(""),
  position: Joi.string().allow(""),
  skills: Joi.string().allow(""),
  notificationPreference: Joi.boolean().default(false),
  verified: Joi.boolean().default(false),
  email: Joi.string().allow("").required(),
  profile: Joi.any(),
  status: joiCommon.joiString
    .valid("ACTIVE", "INACTIVE")
    .default(status.ACTIVE),
}).options({
  abortEarly: false,
});

export const otpVerificationSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.number()
    .min(6)
    .required()
    .label("OTP")
    .messages({ ...errorMessage }),
  type: Joi.string()
    .valid("REGISTER", "FORGOT")
    .required()
    .label("Type")
    .messages({ ...errorMessage }),
}).options({
  abortEarly: false,
});

export const otpResendSchema = Joi.object({
  email: Joi.string().required(),
  type: Joi.string()
    .valid("REGISTER", "FORGOT")
    .required()
    .label("Type")
    .messages({ ...errorMessage }),
}).options({
  abortEarly: false,
});

export const setPasswordSchema = Joi.object({
  password: commonValidation.passwordCommon.label("Password"),
}).options({
  abortEarly: false,
});

export const ResetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .label("Password")
    .messages({
      ...errorMessage,
      "string.pattern.base":
        "{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character",
    }),
}).options({
  abortEarly: false,
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ ignoreLength: true })
    .required()
    .label("Email")
    .messages({
      ...errorMessage,
      "string.email": "{#label} must be a valid email",
    })
    .options({ convert: true }),
}).options({
  abortEarly: false,
});

export const changePasswordSchema = Joi.object({
  oldPassword: commonValidation.passwordCommon.label("Old Password"),
  newPassword: commonValidation.passwordCommon.label("New Password"),
}).options({
  abortEarly: false,
});

export const updateprofileSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ ignoreLength: true })
    .required()
    .label("Email")
    .messages({
      ...errorMessage,
      "string.email": "{#label} must be a valid email",
    })
    .options({ convert: true }),
  phone: Joi.number().allow(""),
  language: Joi.string().optional().allow(""),
  profileImage: Joi.string().optional().allow(""),
  timezone_utc: Joi.string().optional().allow(""),
  dateformat: Joi.string().optional().allow(""),
  timeformat: Joi.string().optional().allow(""),
}).options({
  abortEarly: false,
});

export const resetPasswordSchema = Joi.object({
  password: commonValidation.passwordCommon.label("Password"),
  confirm_password: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password Must match password."),
});

export const resetForgotPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/)
    .required()
    .label("Password")
    .messages({
      ...errorMessage,
      "string.pattern.base":
        "{#label} must have at least one uppercase character, one lowercase character, one numeric character and one special character",
    }),

  email: Joi.string()
    .email({ ignoreLength: true })
    .required()
    .label("Email")
    .messages({
      ...errorMessage,
      "string.email": "{#label} must be a valid email",
    })
    .options({ convert: true }),

  hashToken: Joi.string().required().label("Token"),
}).options({
  abortEarly: false,
});

export const userValidateSchema = Joi.object({
  email: Joi.string()
    .email({ ignoreLength: true })
    .required()
    .label("Email")
    .messages({
      ...errorMessage,
      "string.email": "{#label} must be a valid email",
    })
    .options({ convert: true }),
}).options({
  abortEarly: false,
});
