import Joi from "joi";
export const ClientCreateSchema = Joi.object({
  code: Joi.alternatives()
    .try(Joi.string().trim(), Joi.number())
    .label("Code")
    .required(),
  email: Joi.string().trim().allow("", null).label("Email"),
  name: Joi.string().trim().label("Client Name").required(),
  country: Joi.string().trim().label("Country").required(),
  timezone: Joi.string().trim().label("Timezone").required(),
  clienttype: Joi.string()
    .trim()
    .label("Client Type")
    .valid("client", "sub-client")
    .required(), // new clienttype field added
  currency: Joi.string().trim().label("Currency").allow("", null),
  weekendDays: Joi.string().trim().allow("", null).label("Weekend Days"),
  isAllDays: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  startDate: Joi.date().label("Start Date").required(),
  endDate: Joi.date().label("End Date").required(),
  autoUpdateEndDate: Joi.number().label("Auto Update End Date"),
  timeSheetStartDay: Joi.number()
    .label("Timesheet Start Day")
    .default(1)
    .required(),
  approvalEmail: Joi.array().items(Joi.string().label("Approval Email")),
  isShowPrices: Joi.boolean().default(false).label("Show Prices"),
  isShowCostCenter: Joi.boolean().default(false).label("Show Cost Center"),
  isShowCatalogueNo: Joi.boolean().default(false).label("Show Catalogue No"),
  titreDeConge: Joi.array().items(Joi.string().label("Titre De Conge")),
  isResetBalance: Joi.boolean().default(false).label("Reset Balance"),
  startMonthBack: Joi.number().label("Start Month Back").default(0).required(),
  medicalEmailSubmission: Joi.array().items(
    Joi.string().label("Medical Email Submission")
  ),
  medicalEmailToday: Joi.array().items(
    Joi.string().label("Medical Email Today")
  ),
  medicalEmailMonthly: Joi.array().items(
    Joi.string().label("Medical Email Monthly")
  ),
  isShowNSS: Joi.boolean().default(false).label("Show NSS"),
  isShowCarteChifa: Joi.boolean().default(false).label("Show Carte Chifa"),
  isShowSalaryInfo: Joi.boolean().default(false).label("Show Salary Info"),
  isShowRotation: Joi.boolean().default(false).label("Show Rotation"),
  isShowBalance: Joi.boolean().default(false).label("Show Balance"),
  logo: Joi.any().label("Logo"),
  segment: Joi.string().trim().allow("", null).label("Segment"),
  subSegment: Joi.string().trim().allow("", null).label("Sub Segment"),
  bonusType: Joi.string().trim().allow("", null).label("Bonus Type"),
  isCountCR: Joi.boolean().default(false).label("Count CR"),
  contractN: Joi.string().trim().allow("", null).label("N"),
  stampLogo: Joi.any().label("Logo").allow("", null),
  contractTagline: Joi.string().trim().allow("", null).label("Tagline"),
  address: Joi.string().trim().allow("", null).label("Address"),
  parentClientId: Joi.number().when("clienttype", {
    is: "sub-client",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  startdateatutc: Joi.string().trim().allow("", null),
  enddateatutc: Joi.string().trim().allow("", null),
  taxAmount: Joi.number().label("Tax Amount").default(0),
}).options({
  abortEarly: false,
});

export const ClientUpdateSchema = Joi.object({
  code: Joi.alternatives().try(Joi.string().trim(), Joi.number()).label("Code"),
  email: Joi.string().trim().allow("", null).label("Email"),
  name: Joi.string().trim().label("Client Name"),
  country: Joi.string().trim().label("Country"),
  stampLogo: Joi.any().label("Logo").allow("", null),
  timezone: Joi.string().trim().label("timezone").required(),
  clienttype: Joi.string().trim().label("clienttype").required(), //new clienttype field added
  currency: Joi.string().trim().label("Currency").allow("", null),
  weekendDays: Joi.string().trim().allow("", null).label("Weekend Days"),
  isAllDays: Joi.boolean().default(false),
  isActive: Joi.boolean(),
  startDate: Joi.date().label("Start Date"),
  endDate: Joi.date().label("End Date"),
  autoUpdateEndDate: Joi.number().label("Auto Update End Date"),
  timeSheetStartDay: Joi.number().label("Timesheet Start Day"),
  approvalEmail: Joi.array().items(Joi.string().label("Approval Email")),
  isShowPrices: Joi.boolean().label("Show Prices"),
  isShowCostCenter: Joi.boolean().label("Show Cost Center"),
  isShowCatalogueNo: Joi.boolean().label("Show Catalogue No"),
  titreDeConge: Joi.array().items(Joi.string().label("Titre De Conge")),
  isResetBalance: Joi.boolean().label("Reset Balance"),
  startMonthBack: Joi.number().label("Start Month Back"),
  medicalEmailSubmission: Joi.array().items(
    Joi.string().label("Medical Email Submission")
  ),
  medicalEmailToday: Joi.array().items(
    Joi.string().label("Medical Email Today")
  ),
  medicalEmailMonthly: Joi.array().items(
    Joi.string().label("Medical Email Monthly")
  ),
  isShowNSS: Joi.boolean().label("Show NSS"),
  isShowCarteChifa: Joi.boolean().label("Show Carte Chifa"),
  isShowSalaryInfo: Joi.boolean().label("Show Salary Info"),
  isShowRotation: Joi.boolean().label("Show Rotation"),
  isShowBalance: Joi.boolean().label("Show Balance"),
  logo: Joi.any().label("Logo"),
  segment: Joi.string().trim().allow("", null).label("Segment"),
  subSegment: Joi.string().trim().allow("", null).label("Sub Segment"),
  bonusType: Joi.string().trim().allow("", null).label("Bonus Type"),
  isCountCR: Joi.boolean().default(false).label("Count CR"),
  contractN: Joi.string().trim().allow("", null).label("N"),
  contractTagline: Joi.string().trim().allow("", null).label("Tagline"),
  address: Joi.string().trim().allow("", null).label("Address"),
  parentClientId: Joi.number().when("clienttype", {
    is: "sub-client",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  startdateatutc: Joi.string().trim().allow("", null),
  enddateatutc: Joi.string().trim().allow("", null),
  taxAmount: Joi.number().label("Tax Amount"),
}).options({
  abortEarly: false,
});

export const ClientStatusUpdateSchema = Joi.object({
  isActive: Joi.boolean().required(),
}).options({
  abortEarly: false,
});

export const ClientLeaveUpdateSchema = Joi.object({
  employee_type: Joi.string().valid("ALL", "RESIDENT", "ROTATION"),
  attendanceType: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        code: Joi.string().required(),
      })
    )
    .optional(),
  leaveType: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        code: Joi.string().required(),
        payment_type: Joi.string().required(),
      })
    )
    .optional(),
  overtimeBonusType: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        code: Joi.string().required(),
        bonus_type: Joi.string().required(),
        reliquatValue: Joi.string().optional().allow(""),
        conditions: Joi.array()
          .items(
            Joi.object({
              condition: Joi.string().required(),
              hours: Joi.string().required(),
              factor1: Joi.string().optional().allow(""),
            })
          )
          .optional(),
      })
    )
    .optional(),
  holidayType: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        code: Joi.string().required(),
        dates: Joi.array().items(Joi.string().isoDate().required()),
      })
    )
    .optional(),
}).options({
  abortEarly: false,
});
