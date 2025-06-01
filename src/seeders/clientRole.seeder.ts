import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import Feature from '@/models/feature.model';
import Permission from '@/models/permission.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import RoleRepo from '@/repository/role.repository';
import { Op } from 'sequelize';

const roleData = [
	{
		name: 'Client',
		isViewAll: true,
		defaultPermission: [
			{
				feature: FeaturesNameEnum.Account,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Contact,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Segment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.SubSegment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportVehicleDocument,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportDriver,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportDriverDocument,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TransportRequestVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Salary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Approve, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Message,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.ImportLog,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatAdjustment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.ReliquatPayment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
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
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TransportSummary,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
		],
	},
];

(async function injectSettings(): Promise<void> {
	for (const role of roleData) {
		const roleRepo = new RoleRepo();
		const whereClauseData = { name: role.name };
		const isExistRole = await roleRepo.get({
			where: { ...whereClauseData, deletedAt: null },
		});
		let roleId = null;
		if (!isExistRole) {
			const roles = await Role.create({ ...whereClauseData, isViewAll: role.isViewAll });
			roleId = roles.id;
		} else {
			roleId = isExistRole.id;
			await Role.update(
				{ ...whereClauseData, isViewAll: role.isViewAll },
				{
					where: {
						id: isExistRole.id,
					},
				},
			);
		}
		const permissionIds: number[] = [];
		for (const rolePermission of role.defaultPermission) {
			for (const permission of rolePermission.permission) {
				const isExist = await RolePermission.findOne({
					where: { roleId: roleId },
					include: [
						{
							model: Permission,
							where: { permissionName: permission },
							include: [{ model: Feature, where: { name: rolePermission.feature } }],
						},
					],
				});
				if (!isExist) {
					const permissionData = await Permission.findOne({
						where: { permissionName: permission },
						include: [{ model: Feature, where: { name: rolePermission.feature } }],
					});
					const result = await RolePermission.create({
						roleId: roleId,
						permissionId: permissionData.id,
					});
					permissionIds.push(result.id);
				} else {
					permissionIds.push(isExist.id);
				}
			}
		}
		permissionIds.length &&
			(await RolePermission.destroy({
				where: { roleId: roleId, id: { [Op.notIn]: permissionIds } },
			}));
	}
})()
	.then(async () => {
		console.log('info', 'Client Role Data added successfully...');
	})
	.catch((err) => {
		console.log('error', err.message);
	});
