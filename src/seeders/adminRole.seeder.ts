/* eslint-disable no-console */
import Permission from '@/models/permission.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import FeatureRepo from '@/repository/feature.repository';
import { Op } from 'sequelize';

const roleData = [
	{
		name: 'super admin',
	},
	{
		name: 'manager',
	},
];

(async function injectSettings(): Promise<void> {
	const featureRepo = new FeatureRepo();
	const featuresData = await featureRepo.getAll({
		include: { model: Permission },
	});
	for (const role of roleData) {
		const isExistRole = await Role.findOne({
			where: {
				name: role.name,
			},
		});
		let roleId = null;
		if (!isExistRole) {
			const roles = await Role.create({
				name: role.name,
			});
			roleId = roles.id;
		} else {
			roleId = isExistRole.id;
			await Role.update(
				{
					name: role.name,
				},
				{
					where: {
						id: isExistRole.id,
					},
				},
			);
		}
		const permissionIds: number[] = [];
		if (featuresData.length > 0) {
			for (const featData of featuresData) {
				for (const permission of featData.permissions) {
					const isExist = await RolePermission.findOne({
						where: { roleId: roleId, permissionId: permission.id },
					});
					if (!isExist) {
						const createData = {
							roleId: roleId,
							permissionId: permission.id,
						};
						let result = null;
						switch (role.name) {
							case 'super admin':
								result = await RolePermission.create(createData);
								result && permissionIds.push(result.id);
								break;
							case 'manager':
								['update', 'view'].includes(permission.permissionName) &&
									(result = await RolePermission.create(createData));
								result && permissionIds.push(result.id);
								break;
						}
					} else {
						permissionIds.push(isExist.id);
					}
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
		console.log('info', 'Role Data added successfully...');
	})
	.catch((err) => {
		console.log('error', err.message);
	});
