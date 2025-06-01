import { employeeStatus } from "@/interfaces/model/employee.interface";
import Joi from "joi";
import { joiCommon } from "./common.validation";

export const EmployeeCreateSchema = Joi.object({
  employeeNumber: [
    Joi.string().trim().label("Employee Number").required(),
    Joi.number().label("Employee Number").required(),
  ],
  TempNumber: [
    Joi.string().trim().label("Temp Number").allow("", null),
    Joi.number().label("Temp Number").allow("", null),
  ],
  contractNumber: [
    Joi.string().trim().label("Contract Number").allow("", null),
    Joi.number().label("Contract Number").allow("", null),
  ],
  isAbsenseValueInReliquat: Joi.boolean()
    .label("Is Absense Value In Reliquat")
    .allow("", null)
    .default(false),
  rollover: Joi.boolean().label("Rollover").allow("", null),
  contractEndDate: Joi.date().label("Contract End Date").allow("", null),
  contractSignedDate: Joi.date().label("CNAS Declaration Date").allow("", null),
  timezone: Joi.string().label("Timezone").optional().allow(""),
  startDate: Joi.date().label("Start Date").required(),
  firstName: Joi.string().trim().label("First Name").required(),
  lastName: Joi.string().trim().label("Last Name").required(),
  fonction: Joi.string().trim().label("Fonction").required(),
  dOB: Joi.date().label("Date of Birth").allow("", null),
  placeOfBirth: Joi.string().trim().label("Place Of Birth").allow("", null),
  nSS: Joi.string().trim().label("NSS").allow("", null),
  gender: Joi.string().trim().label("Gender").required(),
  terminationDate: Joi.date().label("Termination Date").allow("", null),
  baseSalary: Joi.number().label("Base Salary").allow("", null),
  travelAllowance: Joi.number().label("Travel Allowance").allow("", null),
  Housing: Joi.number().label("Housing").allow("", null),
  monthlySalary: Joi.number().label("Monthly Salary").allow("", null),
  address: Joi.string().trim().label("Address").allow("", null),
  medicalInsurance: Joi.boolean().label("Medical Insurance").allow("", null),
  dailyCost: Joi.number().label("Daily Cost").allow("", null),
  hourlyRate: Joi.number().label("Hourly Rate").allow("", null),
  mobileNumber: [
    Joi.string().trim().label("Mobile Number").allow("", null),
    Joi.number().label("Mobile Number").allow("", null),
  ],
  nextOfKin: Joi.string().trim().label("Next Of Kin").allow("", null),
  LREDContractEndDate: Joi.date()
    .label("LRED Contract End Date")
    .allow("", null),
  catalogueNumber: [
    Joi.string().trim().label("Catalogue Number").allow("", null),
    Joi.number().label("Catalogue Number").allow("", null),
  ],
  nextOfKinMobile: [
    Joi.string().trim().label("Next Of KinMobile").allow("", null),
    Joi.number().label("Next Of KinMobile").allow("", null),
  ],
  medicalCheckDate: Joi.date().label("Medical Check Date").allow("", null),
  medicalCheckExpiry: Joi.date().label("Medical Check Expiry").allow("", null),
  initialBalance: Joi.number().label("Initial Balance").allow("", null),
  photoVersionNumber: Joi.number()
    .label("Photo Version Number")
    .allow("", null),
  email: Joi.string().trim().label("Email").allow("", null),
  overtime01Bonus: Joi.number().label("Overtime 01 Bonus").allow("", null),
  overtime02Bonus: Joi.number().label("Overtime 02 Bonus").allow("", null),
  weekendOvertimeBonus: Joi.number()
    .label("Weekend Overtime Bonus")
    .allow("", null),
  customBonus: Joi.object().label("Custom Bonus").allow({}, null),
  clientId: Joi.number().label("Client Id").required(),
  segmentId: Joi.number().label("Segment Id").required(),
  rotationDate: Joi.date().label("Rotation Date").allow("", null),
  segmentDate: Joi.date().label("Segment Date").allow("", null),
  salaryDate: Joi.date().label("Salary Date").allow("", null),
  profileType: Joi.string().trim().label("Profile Type").allow("", null),
  subSegmentId: Joi.number().label("sub Segment Id").allow("", null),
  profilePicture: Joi.string().trim().label("Picture").allow("", null),
  employeeStatus: joiCommon.joiString
    .valid("DRAFT", "SAVED")
    .default(employeeStatus.SAVED),
  // currency: Joi.string().optional().allow(""),
  dateformat: Joi.string().optional().allow(""),
  timeformat: Joi.string().optional().allow(""),
  employeeType: Joi.string().trim().valid("Rotation", "Resident"),
  rotationId: Joi.number().label("Rotation Id").optional().allow(null),
  residentId: Joi.number().label("Resident Id").optional().allow(null),
  utcstartDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckExpiry: Joi.string().trim().optional().allow("", null),
  utcdOB: Joi.string().trim().optional().allow("", null),
  utccontractSignedDate: Joi.string().trim().optional().allow("", null),
  utccontractEndDate: Joi.string().trim().optional().allow("", null),
}).options({
  abortEarly: false,
});

export const EmployeeUpdateSchema = Joi.object({
  employeeNumber: [
    Joi.string().trim().label("Employee Number").required(),
    Joi.number().label("Employee Number").required(),
  ],
  TempNumber: [
    Joi.string().trim().label("Temp Number").allow("", null),
    Joi.number().label("Temp Number").allow("", null),
  ],
  contractNumber: [
    Joi.string().trim().label("Contract Number").allow("", null),
    Joi.number().label("Contract Number").allow("", null),
  ],
  profileType: Joi.string().trim().label("Profile Type").allow("", null),
  timezone: Joi.string().label("Timezone").allow("", null),
  startDate: Joi.date().label("Start Date").required(),
  rollover: Joi.boolean().label("Rollover").allow("", null),
  isAbsenseValueInReliquat: Joi.boolean()
    .label("Is Absense Value In Reliquat")
    .allow("", null)
    .default(false),
  firstName: Joi.string().trim().label("First Name").required(),
  lastName: Joi.string().trim().label("Last Name").required(),
  fonction: Joi.string().trim().label("Fonction").required(),
  dOB: Joi.date().label("Date of Birth").allow("", null),
  medicalCheckDate: Joi.date().label("Medical Check Date").allow("", null),
  medicalCheckExpiry: Joi.date().label("Medical Check Expiry").allow("", null),
  placeOfBirth: Joi.string().trim().label("Place Of Birth").allow("", null),
  nSS: Joi.string().trim().label("NSS").allow("", null),
  gender: Joi.string().trim().label("Gender"),
  terminationDate: Joi.date().label("Termination Date").allow("", null),
  baseSalary: Joi.number().label("Base Salary").allow("", null),
  travelAllowance: Joi.number().label("Travel Allowance").allow("", null),
  Housing: Joi.number().label("Housing").allow("", null),
  monthlySalary: Joi.number().label("Monthly Salary").allow("", null),
  address: Joi.string().trim().label("Address").allow("", null),
  profilePicture: Joi.string().trim().label("Picture").allow("", null),
  medicalInsurance: Joi.boolean().label("Medical Insurance").allow("", null),
  dailyCost: Joi.number().label("Daily Cost").allow("", null),
  hourlyRate: Joi.number().label("Hourly Rate").allow("", null),
  mobileNumber: [
    Joi.string().trim().label("Mobile Number").allow("", null),
    Joi.number().label("Mobile Number").allow("", null),
  ],
  nextOfKinMobile: [
    Joi.string().trim().label("Next Of KinMobile").allow("", null),
    Joi.number().label("Next Of KinMobile").allow("", null),
  ],
  initialBalance: Joi.number().label("Initial Balance").allow("", null),
  photoVersionNumber: Joi.number()
    .label("Photo Version Number")
    .allow("", null),
  email: Joi.string().trim().label("Email").allow("", null),
  overtime01Bonus: Joi.number().label("Overtime 01 Bonus").allow("", null),
  overtime02Bonus: Joi.number().label("Overtime 02 Bonus").allow("", null),
  weekendOvertimeBonus: Joi.number()
    .label("Weekend Overtime Bonus")
    .allow("", null),
  customBonus: Joi.object().label("Custom Bonus").allow({}, null),
  clientId: Joi.number().label("Client Id").allow("", null),
  rotationDate: Joi.date().label("Rotation Date").allow("", null),
  salaryDate: Joi.date().label("Salary Date").allow("", null),
  segmentDate: Joi.date().label("Segment Date").allow("", null),
  segmentId: Joi.number().label("Segment Id").required(),
  subSegmentId: Joi.number().label("sub Segment Id").allow("", null),
  contractEndDate: Joi.date().label("Contract End Date").allow("", null),
  contractSignedDate: Joi.date().label("CNAS Declaration Date").allow("", null),
  catalogueNumber: [
    Joi.string().trim().label("Catalogue Number").allow("", null),
    Joi.number().label("Catalogue Number").allow("", null),
  ],
  employeeStatus: joiCommon.joiString
    .valid("DRAFT", "SAVED")
    .default(employeeStatus.SAVED),
  // currency: Joi.string().optional().allow("", null),
  dateformat: Joi.string().optional().allow("", null),
  timeformat: Joi.string().optional().allow("", null),
  employeeType: Joi.string().trim().valid("Rotation", "Resident"),
  rotationId: Joi.number().label("Rotation Id").optional().allow(null),
  residentId: Joi.number().label("Resident Id").optional().allow(null),
  utcstartDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckExpiry: Joi.string().trim().optional().allow("", null),
  utcdOB: Joi.string().trim().optional().allow("", null),
  utccontractSignedDate: Joi.string().trim().optional().allow("", null),
  utccontractEndDate: Joi.string().trim().optional().allow("", null),
}).options({
  abortEarly: false,
});

export const EmployeeTerminateSchema = Joi.object({
  terminationDate: Joi.date().label("Termination Date"),
}).options({
  abortEarly: false,
});

export const EmployeeReactivateSchema = Joi.object({
  startDate: Joi.date().label("Start Date").required(),
  clientId: Joi.number().label("Client Id").allow("", null),
  segmentId: Joi.number().label("Segment Id").required(),
  subSegmentId: Joi.number().label("sub Segment Id").allow("", null),
  rotationId: Joi.number().label("Rotation Id").required(),
}).options({
  abortEarly: false,
});

export const EmployeeBankUpdateSchema = Joi.object({
  bankId: Joi.number().label("Bank Id"),
});

export const EmployeeStatusUpdateSchema = Joi.object({
  status: Joi.boolean().label("Status").required(),
}).options({
  abortEarly: false,
});

export const EmployeeFetchAllSchema = Joi.object({
  page: Joi.number().label("Page").allow("", null),
  limit: Joi.number().label("Limit").allow("", null),
  sort: Joi.string().label("Sort").allow("", null),
  sortBy: Joi.string().label("SortBy").allow("", null),
  clientId: Joi.number().label("Client Id").optional().allow("", null),
  search: Joi.string().label("Search").allow("", null),
  isTerminatatedEmployee: Joi.boolean().default(false).allow("", null),
  activeStatus: Joi.string().label("Active Status").allow("", null),
  startDate: Joi.date().label("Start Date").allow("", null),
  endDate: Joi.date().label("End Date").allow("", null),
  segmentId: Joi.number().label("Segment").allow("", null),
  subSegmentId: Joi.number().label("Sub Segment").allow("", null),
  isActive: Joi.boolean().label("Is Active").default(false),
  isExportPage: Joi.boolean().label("Is Active").default(false),
  utcstartDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckDate: Joi.string().trim().optional().allow("", null),
  utcmedicalCheckExpiry: Joi.string().trim().optional().allow("", null),
  utcdOB: Joi.string().trim().optional().allow("", null),
  utccontractSignedDate: Joi.string().trim().optional().allow("", null),
}).options({
  abortEarly: false,
});

export const EmployeeUByUserId = Joi.object({
  clientId: Joi.number().label("Client Id is Required").required(),
}).options({
  abortEarly: false,
});

// export const EmployeeStutasRequestCreate = Joi.object({
//   clientId: Joi.number().label("Client Id is Required").required(),
//   employeeId: Joi.number().label("Employee Id is Required").required(),
//   reason: Joi.string().trim().optional().allow("", null),
//   requestType: Joi.string().trim().label("Request Type is Required").required(),
// }).options({
//   abortEarly: false,
// });

export const EmployeeStutasRequestCreate = Joi.object({
  reason: Joi.string().trim().optional().allow("", null),
  requestType: Joi.string().trim().label("Request Type is Required").required(),
}).options({
  abortEarly: false,
});

export const EmployeeStutasRequestGet = Joi.object({
  clientId: Joi.number().label("Client Id is Required").required(),
}).options({
  abortEarly: false,
});

export const EmployeeStutasRequestTermination = Joi.object({
  terminationDate: Joi.date().label("Termination Date"),
  employeStatus: Joi.string().label("Employe Status is Required").required(),
  actionStatus: Joi.string().label("Action Status is Required").required()
}).options({
  abortEarly: false,
});

export const EmployeeStutasRequestReactivation = Joi.object({
  startDate: Joi.date().label("Start Date").required(),
  clientId: Joi.number().label("Client Id").allow("", null),
  segmentId: Joi.number().label("Segment Id").required(),
  subSegmentId: Joi.number().label("sub Segment Id").allow("", null),
  rotationId: Joi.number().label("Rotation Id").required(),
  employeStatus: Joi.string().label("Employe Status is Required").required(),
  actionStatus: Joi.string().label("Action Status is Required").required()
}).options({
  abortEarly: false,
});


export const EmployeeStutasRequestReasonUpdate = Joi.object({
  reason: Joi.string().trim().optional().allow("", null),
}).options({
  abortEarly: false,
});
