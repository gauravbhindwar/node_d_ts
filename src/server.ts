import { validateEnv } from "utils/common.util";
import App from "./app";
import AccountRoute from "./routes/account.route";
import AccountPORoute from "./routes/accountPo.route";
import ApproveDeletedFileRoutes from "./routes/approveDeletedFile.route";
import AttendanceTypeMasterRoute from "./routes/attendanceTypes.route";
import AuditLogsRoutes from "./routes/audit.route";
import AuthRoute from "./routes/auth.route";
import BankRouts from "./routes/bankDetails.route";
import BonusTypeRoute from "./routes/bonusType.route";
import ClientsRoute from "./routes/client.route";
import ContactRoute from "./routes/contact.route";
import ContractTemplateRoutes from "./routes/contractTemplate.route";
import ContractTemplateVersionRoutes from "./routes/contractTemplateVersion.route";
import DashboardRoute from "./routes/dashboard.route";
import EmployeeRoutes from "./routes/employee.route";
import EmployeeContractRoutes from "./routes/employeeContract.route";
import EmployeeFileRoutes from "./routes/employeeFile.route";
import EmployeeLeaveRoute from "./routes/employeeLeave.route";
import ErrorLogsRoutes from "./routes/errorLog.route";
import FeatureRoute from "./routes/feature.route";
import FolderRoute from "./routes/folder.route";
import GlobalSettings from "./routes/globalsettings.route";
import HolidayTypeMasterRoute from "./routes/holidayTypeMaster.route";
import ImportLogRoutes from "./routes/importLog.route";
import IncrementRequestRoute from "./routes/incrementRequests.route";
import LeaveTypeMasterRoute from "./routes/leaveType.route";
import MedicalRequestRoute from "./routes/medicalRequest.route";
import MedicalTypeRoute from "./routes/medicalType.route";
import MessageRoutes from "./routes/message.route";
import OvertimeBonusTypeMasterRoute from "./routes/overTimeBonusTypeMaster.route";
import ReliquatAdjustmentRoute from "./routes/reliquatAdjustment.route";
import ReliquatCalculationRoutes from "./routes/reliquatCalculation.route";
import ReliquatCalculationV2Routes from "./routes/reliquatCalculationV2.route";
import ReliquatPaymentRoute from "./routes/reliquatPayment.route";
import RequestRoute from "./routes/request.route";
import RequestTypeRoute from "./routes/requestType.route";
import ResidentRoute from "./routes/resident.route";
import RoleRoute from "./routes/role.route";
import RotationRoute from "./routes/rotation.route";
import SegmentRoutes from "./routes/segment.route";
import StrategiesRoutes from "./routes/strategies.route";
import SubSegmentRoutes from "./routes/subSegment.route";
import TimesheetRoutes from "./routes/timesheet.route";
import TimesheetScheduleRoutes from "./routes/timesheetSchedule.route";
import TransportCapacityRoute from "./routes/transport.capacity.route";
import TransportModelsRoute from "./routes/transport.common.route";
import TransportDriverDocumentRoute from "./routes/transport.driver.document.route";
import TransportDriverRoute from "./routes/transport.driver.route";
import TransportRequestRoute from "./routes/transport.request.route";
import TransportRequestVehicleRoute from "./routes/transport.request.vehicle.route";
import TransportVehicleDocumentRoute from "./routes/transport.vehicle.document.route";
import TransportVehicleRoute from "./routes/transport.vehicle.route";
import UsersRoute from "./routes/user.route";
import XeroRoute from "./routes/xero.route";

validateEnv();

const appServer = new App([
  // All routes
  new AuthRoute(),
  new UsersRoute(),
  new FeatureRoute(),
  new RoleRoute(),
  new StrategiesRoutes(),
  new ClientsRoute(),
  new FolderRoute(),
  new ContactRoute(),
  new SegmentRoutes(),
  new SubSegmentRoutes(),
  new BonusTypeRoute(),
  new MedicalTypeRoute(),
  new RequestTypeRoute(),
  new RotationRoute(),
  new ResidentRoute(),
  new TransportModelsRoute(),
  new TransportCapacityRoute(),
  new TransportVehicleRoute(),
  new TransportVehicleDocumentRoute(),
  new TransportDriverRoute(),
  new TransportRequestRoute(),
  new TransportDriverDocumentRoute(),
  new TransportRequestVehicleRoute(),
  new ContractTemplateRoutes(),
  new ContractTemplateVersionRoutes(),
  new EmployeeRoutes(),
  new EmployeeContractRoutes(),
  new MedicalRequestRoute(),
  new EmployeeFileRoutes(),
  new EmployeeLeaveRoute(),
  new TimesheetRoutes(),
  new RequestRoute(),
  new ErrorLogsRoutes(),
  new MessageRoutes(),
  new ImportLogRoutes(),
  new TimesheetScheduleRoutes(),
  new DashboardRoute(),
  new ReliquatAdjustmentRoute(),
  new ReliquatPaymentRoute(),
  new ReliquatCalculationRoutes(),
  new ReliquatCalculationV2Routes(),
  new ApproveDeletedFileRoutes(),
  new AccountRoute(),
  new XeroRoute(),
  new AccountPORoute(),
  // new GlobalSettings(),
  new BankRouts(),
  new AuditLogsRoutes(),
  new IncrementRequestRoute(),
  new LeaveTypeMasterRoute(),
  new OvertimeBonusTypeMasterRoute(),
  new HolidayTypeMasterRoute(),
  new AttendanceTypeMasterRoute(),
]);
appServer.listen();

export default appServer;
