import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import Feature from '@/models/feature.model';
import Permission from '@/models/permission.model';
import RolePermission from '@/models/rolePermission.model';
import RoleRepo from '@/repository/role.repository';
import { Op } from 'sequelize';

const roleList = [
	{
		roleName: 'Admin',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Portal',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminViewer',
		permissions: [
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.View],
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
	{
		roleName: 'TimesheetPreparation',
		permissions: [
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View, PermissionEnum.Create, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminEmployee',
		permissions: [
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminContracts',
		permissions: [
			{
				feature: FeaturesNameEnum.ContractTemplate,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplateVersion,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Accounts',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Account,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminTransport',
		permissions: [
			{
				feature: FeaturesNameEnum.TransportDriver,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportDriverDocument,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportRequestVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportSummary,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportVehicleDocument,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
		],
	},
	{
		roleName: 'TimesheetApproval',
		permissions: [
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View, PermissionEnum.Approve],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Transport',
		permissions: [
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
		],
	},
	{
		roleName: 'User',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'HR',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplate,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplateVersion,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Approvals',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Approve, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculationV2,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.DailyRate,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Preparator',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculationV2,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.DailyRate,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Viewers',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Role,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Users,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Account,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Client,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Contact,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Folder,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Segment,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.SubSegment,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.MedicalType,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.RequestType,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Rotation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportVehicle,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportVehicleDocument,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportDriver,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportDriverDocument,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportRequestVehicle,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplate,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplateVersion,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Salary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.DailyRate,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ErrorLogs,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Message,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.SalaryMessage,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ImportLog,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatAdjustment,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatPayment,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculationV2,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ApproveDeletedFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
];
const roleRepo = new RoleRepo();

interface IRoleData {
	roleName: string;
	permissions: { feature: string; permission: string[] }[];
}

(async function injectRole() {
	// Start Role Migration

	console.log('info', '--------------------Start Role Migration--------------------');
	for (const data of roleList as IRoleData[]) {
		try {
			const isRoleExist = await roleRepo.get({ where: { name: data.roleName, deletedAt: null } });
			let roleId = null;
			if (!isRoleExist) {
				const result = await roleRepo.create({ name: data.roleName });
				roleId = result.id;
			} else {
				roleId = isRoleExist.id;
			}
			const defaultPermissionId = [];
			for (const element of data.permissions) {
				for (const permission of element.permission) {
					const permissionData = await Permission.findOne({
						where: { permissionName: permission },
						include: [{ model: Feature, where: { name: element.feature } }],
					});
					if (permissionData) {
						const isExistData = await roleRepo.checkAvailableAssignedPermission(permissionData.id, roleId);
						if (!isExistData) {
							const result = await RolePermission.create({
								permissionId: permissionData.id,
								roleId: roleId,
							});
							if (result) defaultPermissionId.push(permissionData.id);
						} else {
							defaultPermissionId.push(permissionData.id);
						}
					}
				}
			}
			// For Delete Extra permissions
			await RolePermission.destroy({
				where: { permissionId: { [Op.notIn]: defaultPermissionId }, roleId: roleId },
			});
		} catch (error) {
			console.log(error);
		}
	}
	console.log('info', '--------------------End Role Migration--------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
