import { FeatureTypeEnum, FeaturesNameEnum } from '@/interfaces/functional/feature.interface';
import Permission from '@/models/permission.model';
import RolePermission from '@/models/rolePermission.model';
import UserPermission from '@/models/userPermission.model';
import FeatureRepo from '@/repository/feature.repository';
import { Op } from 'sequelize';

const featureData = [
	{
		featurename: FeaturesNameEnum.Role,
		type: FeatureTypeEnum.Admin,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Users,
		type: FeatureTypeEnum.Admin,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Account,
		type: FeatureTypeEnum.Account,
		permission: ['view', 'update'],
	},
	{
		featurename: FeaturesNameEnum.AccountPO,
		type: FeatureTypeEnum.Account,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.BonusType,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.LeaveType,
		type: FeatureTypeEnum.Setup,			
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.AttendanceType,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.OvertimeBonus,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Holidays,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],	
	},
	{
		featurename: FeaturesNameEnum.Client,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Contact,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Folder,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Segment,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.SubSegment,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.MedicalType,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.RequestType,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Rotation,
		type: FeatureTypeEnum.Setup,
		permission: ['create', 'update', 'delete', 'view'],
	},
	// {
	// 	featurename: FeaturesNameEnum.TransportModel,
	// 	permission: ['create', 'update', 'delete', 'view'],
	// },
	// {
	// 	featurename: FeaturesNameEnum.TransportCapacity,
	// 	permission: ['create', 'update', 'delete', 'view'],
	// },
	{
		featurename: FeaturesNameEnum.TransportSummary,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportVehicle,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportVehicleDocument,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportDriver,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportDriverDocument,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportRequest,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TransportRequestVehicle,
		type: FeatureTypeEnum.Transport,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ContractTemplate,
		type: FeatureTypeEnum.Contract,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ContractTemplateVersion,
		type: FeatureTypeEnum.Contract,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Employee,
		type: FeatureTypeEnum.Employee,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Salary,
		type: FeatureTypeEnum.Employee,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.DailyRate,
		type: FeatureTypeEnum.Employee,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.EmployeeContract,
		type: FeatureTypeEnum.Contract,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.MedicalRequest,
		type: FeatureTypeEnum.Medical,
		permission: ['create', 'update', 'view'],
	},
	{
		featurename: FeaturesNameEnum.EmployeeFile,
		type: FeatureTypeEnum.Employee,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.EmployeeLeave,
		type: FeatureTypeEnum['Titre De Conge'],
		permission: ['create', 'update', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Request,
		type: FeatureTypeEnum.Request,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ErrorLogs,
		type: FeatureTypeEnum.Admin,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.Message,
		type: FeatureTypeEnum.Admin,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.SalaryMessage,
		type: FeatureTypeEnum.Admin,
		permission: ['update', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ImportLog,
		type: FeatureTypeEnum.Employee,
		permission: ['create', 'view'],
	},
	{
		featurename: FeaturesNameEnum.Timesheet,
		type: FeatureTypeEnum.Timesheet,
		permission: ['create', 'update', 'approve', 'view'],
	},
	{
		featurename: FeaturesNameEnum.TimesheetSummary,
		type: FeatureTypeEnum.Timesheet,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.Dashboard,
		type: FeatureTypeEnum.Global,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.ReliquatAdjustment,
		type: FeatureTypeEnum.Employee,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ReliquatPayment,
		type: FeatureTypeEnum.Employee,
		permission: ['create', 'update', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ReliquatCalculation,
		type: FeatureTypeEnum.Employee,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.ReliquatCalculationV2,
		type: FeatureTypeEnum.Employee,
		permission: ['view'],
	},
	{
		featurename: FeaturesNameEnum.ApproveDeletedFile,
		type: FeatureTypeEnum.Admin,
		permission: ['create', 'delete', 'view'],
	},
	{
		featurename: FeaturesNameEnum.ContractEnd,
		type: FeatureTypeEnum.Contract,
		permission: ['update', 'view'],
	},
	// {
	// 	featurename: FeaturesNameEnum.EmployeeApproval,
	// 	type: FeatureTypeEnum.Employee,
	// 	permission: ['approve'],
	// },
];

(async function injectSettings(): Promise<void> {
	const featureRepo = new FeatureRepo();
	const featureIds = [];
	for (const feature of featureData) {
		const permissionIds: number[] = [];
		const isExistFeature = await featureRepo.get({
			where: {
				name: feature.featurename,
			},
			include: [{ model: Permission, attributes: ['id', 'permissionName'] }],
		});

		let featureId = null;
		if (!isExistFeature) {
			const features = await featureRepo.create({
				name: feature.featurename,
				type: feature.type,
			});

			featureId = features.id;
			featureIds.push(featureId);
		} else {
			await isExistFeature.update({ type: feature.type });
			featureId = isExistFeature.id;
			featureIds.push(featureId);
		}
		for (const element of feature.permission) {
			const isExist = await Permission.findOne({
				where: { permissionName: element, featureId: featureId },
			});
			if (!isExist) {
				const permissionData = await Permission.create({
					permissionName: element,
					featureId: featureId,
				});
				permissionData && permissionIds.push(permissionData.id);
			} else {
				permissionIds.push(isExist.id);
			}
		}
		permissionIds.length &&
			(await Permission.destroy({ where: { featureId: featureId, id: { [Op.notIn]: permissionIds } } }));
	}

	if (featureIds.length) {
		const permissionList = (await Permission.findAll({ where: { featureId: { [Op.notIn]: featureIds } } })).map(
			(permission) => permission.id,
		);
		await featureRepo.deleteData({ where: { id: { [Op.notIn]: featureIds } } });
		await Permission.destroy({ where: { featureId: { [Op.notIn]: featureIds } } });
		if (permissionList.length) {
			await RolePermission.destroy({ where: { permissionId: { [Op.in]: permissionList } } });
			await UserPermission.destroy({ where: { permissionId: { [Op.in]: permissionList } } });
		}
	}
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('info', 'Feature Data added successfully...');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('error', err.message);
	});
