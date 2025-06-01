export enum FeaturesNameEnum {
  Role = "Role",
  Users = "Users",
  Account = "Account",
  AccountPO = "AccountPO",
  BonusType = "Bonus Type",
  Client = "Client",
  Contact = "Contact",
  Folder = "Folder",
  Segment = "Segment",
  SubSegment = "Sub Segment",
  MedicalType = "Medical Type",
  RequestType = "Request Type",
  Rotation = "Rotation",
  // TransportModel = 'Transport Model',
  // TransportCapacity = 'Transport Capacity',
  TransportSummary = "Transport Summary", // Transport Model and Capacity both
  TransportVehicle = "Transport Vehicle",
  TransportVehicleDocument = "Transport Vehicle Document",
  TransportDriver = "Transport Driver",
  TransportDriverDocument = "Transport Driver Document",
  TransportRequest = "Transport Request",
  TransportRequestVehicle = "Transport Request Vehicle",
  ContractTemplate = "Contract Template",
  ContractTemplateVersion = "Contract Template Version",
  Employee = "Employee",
  // EmployeeApproval = 'Employee Approval',
  Salary = "Salary",
  DailyRate = "Daily Rate",
  EmployeeContract = "Employee Contract",
  MedicalRequest = "Medical Request",
  EmployeeFile = "Employee File",
  EmployeeLeave = "Employee Leave",
  Timesheet = "Timesheet",
  Request = "Request",
  ErrorLogs = "Error Logs",
  Message = "Message",
  SalaryMessage = "Salary Message",
  ImportLog = "Import Log",
  Dashboard = "Dashboard",
  ReliquatAdjustment = "Reliquat Adjustment",
  ReliquatPayment = "Reliquat Payment",
  ReliquatCalculation = "Reliquat Calculation",
  ReliquatCalculationV2 = "Reliquat Calculation V2",
  ApproveDeletedFile = "Approve Deleted File",
  TimesheetSummary = "Timesheet Summary",
  ContractEnd = "Contract End",
  TimeSheetRequest = "Timesheet Request",
  IncrementSalary = "Increment Salary",
  AuditLogs = "Audit Logs",
  EmployeeRequest = "Employee Request",
  OvertimeBonus = "Overtime Bonus",
  LeaveType= "Leave Type",
  Holidays = "Holidays",
  AttendanceType = "Attendance Type"
}

export enum PermissionEnum {
  Update = "update",
  Delete = "delete",
  Create = "create",
  View = "view",
  List = "list",
  Approve = "approve",
}

export enum FeatureTypeEnum {
  Global = "Global",
  Admin = "Admin",
  Setup = "Setup",
  Employee = "Employee",
  "Titre De Conge" = "Titre De Conge",
  Timesheet = "Timesheet",
  Contract = "Contract",
  Medical = "Medical",
  Request = "Request",
  Account = "Account",
  Transport = "Transport",
}

export enum DefaultRoles {
  Employee = "Employee",
  Client = "Client",
}

export const defaultPermissionList = [
  {
    permission: {
      feature: FeaturesNameEnum.Employee,
      permission: PermissionEnum.View,
    },
    defaultPermission: [
      {
        feature: FeaturesNameEnum.EmployeeLeave,
        permission: [PermissionEnum.Create],
      },
      {
        feature: FeaturesNameEnum.MedicalRequest,
        permission: [PermissionEnum.Create, PermissionEnum.Update],
      },
      {
        feature: FeaturesNameEnum.ReliquatAdjustment,
        permission: [PermissionEnum.Create, PermissionEnum.Update],
      },
      {
        feature: FeaturesNameEnum.ReliquatPayment,
        permission: [PermissionEnum.Create, PermissionEnum.Update],
      },
      {
        feature: FeaturesNameEnum.EmployeeContract,
        permission: [PermissionEnum.Create, PermissionEnum.Update],
      },
      {
        feature: FeaturesNameEnum.Timesheet,
        permission: [PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.TimesheetSummary,
        permission: [PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.Dashboard,
        permission: [PermissionEnum.View],
      },
    ],
  },
  {
    permission: {
      feature: FeaturesNameEnum.EmployeeFile,
      permission: PermissionEnum.View,
    },
    defaultPermission: [
      {
        feature: FeaturesNameEnum.Request,
        permission: [PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.Employee,
        permission: [PermissionEnum.View],
      },
    ],
  },
  {
    permission: {
      feature: FeaturesNameEnum.BonusType,
      permission: PermissionEnum.View,
    },
    defaultPermission: [
      {
        feature: FeaturesNameEnum.Employee,
        permission: [PermissionEnum.Create, PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.ImportLog,
        permission: [PermissionEnum.Create, PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.Timesheet,
        permission: [PermissionEnum.View],
      },
      {
        feature: FeaturesNameEnum.TimesheetSummary,
        permission: [PermissionEnum.View],
      },
    ],
  },
];
