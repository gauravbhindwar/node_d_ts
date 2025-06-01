/* eslint-disable no-console */
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import Feature from '@/models/feature.model';
import Permission from '@/models/permission.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import RoleRepo from '@/repository/role.repository';

const roleData = [
	{
		name: 'Employee',
		isViewAll: true,
		defaultPermission: [
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Salary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
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
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
		],
	},
];

(async function injectSettings(): Promise<void> {
	for (const role of roleData) {
		const roleRepo = new RoleRepo();
		const whereClauseData = { name: role.name };
		const isExistRole = await roleRepo.get({
			where: whereClauseData,
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
					await RolePermission.create({
						roleId: roleId,
						permissionId: permissionData.id,
					});
				}
			}
		}
	}
})()
	.then(async () => {
		console.log('info', 'Employee Role Data added successfully...');
	})
	.catch((err) => {
		console.log('error', err.message);
	});
