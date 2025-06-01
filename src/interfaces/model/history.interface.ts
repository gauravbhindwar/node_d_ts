export enum statusEnum {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT",
  SENT_TO_CLIENT = "SENT_TO_CLIENT",
  LOGIN = "LOGIN",
}

export enum moduleName {
  DASHBOARD = "DASHBOARD",
  SETUP = "SETUP",
  ADMIN = "ADMIN",
  ACCOUNTS = "ACCOUNTS",
  EMPLOYEES = "EMPLOYEES",
  TITREDECONGE = "TITREDECONGE",
  MEDICAL = "MEDICAL",
  TIMESHEETS = "TIMESHEETS",
  REQUESTS = "REQUESTS",
  CONTRACTS = "CONTRACTS",
  TRANSPORT = "TRANSPORT",
  LOGIN = "LOGIN",
}

export enum tableEnum {
  ACCOUNT = "account",
  ACCOUNT_PO = "account_po",
  BONUS_TYPE = "bonus_type",
  CLIENT = "client",
  CONTACT = "contact",
  CONTRACT_TEMPLATE = "contract_template",
  CONTRACT_TEMPLATE_VERSION = "contract_template_version",
  EMPLOYEE = "employee",
  EMPLOYEE_TERMINATE = "employee_terminate",
  EMPLOYEE_CONTRACT = "employee_contract",
  EMPLOYEE_FILE = "employee_file",
  EMPLOYEE_LEAVE = "employee_leave",
  EMPLOYEE_ROTATION = "employee_rotation",
  EMPLOYEE_SALARY = "employee_salary",
  ERROR_LOGS = "error_logs",
  FEATURES = "features",
  FOLDER = "folder",
  IMPORT_LOGS = "import_logs",
  MEDICAL_REQUEST = "medical_request",
  MEDICAL_TYPE = "medical_type",
  MESSAGE = "message",
  RELIQUAT_ADJUSTMENT = "reliquat_adjustment",
  RELIQUAT_CALCULATION = "reliquat_calculation",
  RELIQUAT_PAYMENT = "reliquat_payment",
  REQUEST_DOCUMENT = "request_document",
  REQUEST_TYPE = "request_type",
  REQUESTS = "requests",
  ROLE = "role",
  ROTATION = "rotation",
  RESIDENT = "resident",
  SEGMENT = "segment",
  SUB_SEGMENT = "sub_segment",
  TIMESHEET = "timesheet",
  TIMESHEET_REQUEST = "timesheet_request",
  TIMESHEET_SCHEDULE = "timesheet_schedule",
  TRANSPORT_CAPACITY = "transport_capacity",
  TRANSPORT_DRIVER = "transport_driver",
  TRANSPORT_DRIVER_DOCUMENTS = "transport_driver_documents",
  TRANSPORT_MODEL = "transport_model",
  TRANSPORT_REQUEST = "transport_request",
  TRANSPORT_REQUEST_VEHICLE = "transport_request_vehicle",
  TRANSPORT_VEHICLE = "transport_vehicle",
  TRANSPORT_VEHICLE_DOCUMENTS = "transport_vehicle_documents",
  USER = "user",
  USER_CLIENT = "user_client",
  USER_SEGMENT = "user_segment",
  INCREMENT_REQUESTS = "increment_requests"
}

export interface IHistoryCreate {
  id: number;
  tableName: string;
  moduleName?: string;
  jsonData: JSON;
  userId?: number;
  // status: statusEnum;
  activity: statusEnum;
  custom_message?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastlogintime?: string;
  lastlogouttime?: string;
  systemUtilisationTime?: string;
}

export interface HistoryAttributes {
  id: number;
  tableName: string;
  moduleName?: string;
  jsonData: JSON;
  // status: statusEnum;
  activity: statusEnum;
  userId?: number;
  custom_message?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdatutc?: string;
  updatedatutc?: string;
  deletedatutc?: string;
  lastlogintime?: string;
  lastlogouttime?: string;
  systemUtilisationTime?: string;
}
