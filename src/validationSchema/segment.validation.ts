import Joi from "joi";

export const SegmentCreateSchema = Joi.object({
  code: [
    Joi.string().trim().label("Code").required(),
    Joi.number().label("Code").required(),
  ],
  name: Joi.string().trim().label("Segment Name").required(),
  contactId: Joi.number().allow("", null).label("Contact Id"),
  clientId: Joi.number().label("Client Id").required(),
  timeSheetStartDay: Joi.number().label("Timesheet Start Day"),
  costCentre: Joi.string().trim().allow("", null).label("Cost Center"),
  fridayBonus: Joi.number().allow("", null).label("Friday Bonus"),
  saturdayBonus: Joi.number().allow("", null).label("Saturday Bonus"),
  overtime01Bonus: Joi.number().allow("", null).label("Overtime 01 bonus"),
  overtime02Bonus: Joi.number().allow("", null).label("Overtime 02 bonus"),
  vatRate: Joi.number().allow("", null).label("VAT Rate"),
  xeroFormat: Joi.number().allow("", null).label("Xero Format"),
  isActive: Joi.boolean().default(true),
  segmentManagers: Joi.array().items(Joi.number()),
}).options({
  abortEarly: false,
});

export const SegmentUpdateSchema = Joi.object({
  code: [
    Joi.string().trim().label("Code").required(),
    Joi.number().label("Code").required(),
  ],
  name: Joi.string().trim().label("Segment Name"),
  contactId: Joi.number().allow("", null).label("Contact Id"),
  timeSheetStartDay: Joi.number().label("Timesheet Start Day"),
  clientId: Joi.number().label("Client Id"),
  costCentre: Joi.string().trim().allow("", null).label("Cost Center"),
  fridayBonus: Joi.number().allow("", null).label("Friday Bonus"),
  saturdayBonus: Joi.number().allow("", null).label("Saturday Bonus"),
  overtime01Bonus: Joi.number().allow("", null).label("Overtime 01 bonus"),
  overtime02Bonus: Joi.number().allow("", null).label("Overtime 02 bonus"),
  vatRate: Joi.number().allow("", null).label("VAT Rate"),
  xeroFormat: Joi.number().allow("", null).label("Xero Format"),
  isActive: Joi.boolean().default(true),
  segmentManagers: Joi.array().items(Joi.number()),
}).options({
  abortEarly: false,
});

export const SegmentFetchAllSchema = Joi.object({
  page: Joi.number().label("Page"),
  limit: Joi.number().label("Limit"),
  sort: Joi.string().label("Sort"),
  sortBy: Joi.string().label("SortBy").allow("", null),
  clientId: Joi.number().label("Client Id").required(),
  search: Joi.alternatives(Joi.string(), Joi.number())
    .label("Search")
    .allow("", null),
  isActive: Joi.boolean().allow("", null),
}).options({
  abortEarly: false,
});

export const segmentStatusUpdateSchema = Joi.object({
  isActive: Joi.boolean().required(),
}).options({
  abortEarly: false,
});
