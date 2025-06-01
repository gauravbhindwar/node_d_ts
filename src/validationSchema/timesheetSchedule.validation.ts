import Joi from "joi";
import { joiCommon } from "./common.validation";

export const TimesheetScheduleFetchAllSchema = Joi.object({
  startDate: Joi.string().label("Start Date").required(),
  endDate: Joi.string().label("End Date").required(),
  clientId: Joi.number().label("Client Id").required(),
  activeTab: Joi.string().label("Active Tab").required(),
  subSegmentId: Joi.number().label("Sub Segment Id").allow(null, ""),
  segmentId: Joi.number().label("Segment Id").allow(null, ""),
  page: Joi.number().label("Page"),
  limit: Joi.number().label("Limit"),
  search: Joi.string().label("Search").allow("", null),
}).options({
  abortEarly: false,
});

export const TimesheetScheduleUpdateSchema = Joi.object({
  scheduleIds: Joi.array().items(Joi.number().allow(null, "")),
  employeeId: Joi.number().label("Employee Id").allow(null, ""),
  isLeaveForTitreDeConge: Joi.boolean()
    .label("isLeaveForTitreDeConge")
    .allow("", null),
  startDate: Joi.string().label("Start Date").allow(null, ""),
  endDate: Joi.string().label("End Date").allow(null, ""),
  updateStatus: Joi.string().label("Update Status").required(),
  updateStatusId: Joi.number().label("Update Status").required(),
  overtimeHours: Joi.number().label("Overtime Hours"),
  overtimeBonusType: Joi.string().label("Overtime Bonus Type"),
  isBonus: Joi.boolean().label("Is Bonus"),
}).options({
  abortEarly: false,
});

export const clientLeaveDropDownSchema = Joi.object({
  clientId: joiCommon.joiNumber.required(),
  employeeId: joiCommon.joiNumber.required(),
}).options({
  abortEarly: false,
});
