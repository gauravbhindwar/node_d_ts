import { employeeStatus } from "@/interfaces/model/employee.interface";
import Joi from "joi";
import { joiCommon } from "./common.validation";

export const bankDetailsaddSchema = Joi.object({
    bankName: Joi.string().label("bankName").allow("", null),
    ribNumber: Joi.number().label("Rib Number").allow(null),
    loginUserId: Joi.number().label("loginUserId").allow(null),
}).options({
    abortEarly: false,
  });


