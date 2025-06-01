import { PermissionEnum, defaultPermissionList } from '@/interfaces/functional/feature.interface';
import Feature from '@/models/feature.model';
import Permission from '@/models/permission.model';
import UserPermission from '@/models/userPermission.model';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';

const userRepo = new UserRepo();

function GetPermissionData(featurePermission: Permission[], name: string, permission: PermissionEnum) {
	return featurePermission.find((feature) => feature.feature.name == name && feature.permissionName == permission)?.id;
}

async function GetDefaultPermissionData(featurePermission) {
	const data = defaultPermissionList?.map((value) => {
		return {
			permission: GetPermissionData(featurePermission, value.permission?.feature, value?.permission?.permission),
			defaultPermission: value.defaultPermission
				?.map((permission) => {
					return permission?.permission?.map((per) => GetPermissionData(featurePermission, permission?.feature, per));
				})
				?.flat(),
		};
	});
	return parse(data);
}

async function AssignDefaulPermission(defaultPermission, permissions: number[]) {
	permissions?.map((perm) => {
		const defaultData = defaultPermission?.filter((per) => per.defaultPermission.includes(perm));
		if (defaultData?.length) {
			for (const perms of defaultData) {
				if (perms.permission && !permissions.includes(perms.permission)) {
					permissions.push(perms.permission);
					AssignDefaulPermission(defaultPermission, permissions);
				}
			}
		}
	});
	return permissions;
}

(async function injectUserPermission() {
	console.log('info', '--------------------Start User Permission Migration--------------------');
	const users = await userRepo.getAll({
		order: [['id', 'asc']],
		attributes: ['id', 'loginUserId', 'roleId'],
	});
	const featurePermission = await Permission.findAll({
		where: { deletedAt: null },
		include: [{ model: Feature, attributes: ['name'] }],
	});

	for (const user of users) {
		const userPermissions = await UserPermission.findAll({
			where: { loginUserId: user.loginUserId },
			include: [
				{
					model: Permission,
					attributes: ['id', 'permissionName'],
					include: [{ model: Feature, attributes: ['id', 'name'] }],
				},
			],
			order: [['id', 'asc']],
		});
		for (const userPermission of userPermissions) {
			if (userPermission.roleId != user.roleId) {
				await UserPermission.update({ roleId: user.roleId }, { where: { id: userPermission.id } });
			}
		}

		const featureList: string[] = [];
		const permissionId: number[] = [];

		userPermissions.forEach((userpermission) => {
			const featureName = userpermission.permission.feature.name;
			permissionId.push(userpermission.permissionId);
			if (!featureList.includes(featureName)) {
				featureList.push(featureName);
			}
		});

		featurePermission.forEach((feature) => {
			if (
				featureList.includes(feature.feature.name) &&
				feature.permissionName === PermissionEnum.View &&
				!permissionId.includes(feature.id)
			) {
				permissionId.push(feature.id);
			}
		});

		const defaultPerm = await GetDefaultPermissionData(featurePermission);
		const result = await AssignDefaulPermission(defaultPerm, permissionId);
		if (result) {
			for (const permissions of result) {
				if (!userPermissions.find((per) => per.permissionId == permissions)) {
					await UserPermission.create({
						permissionId: permissions,
						loginUserId: user.loginUserId,
						roleId: user.roleId,
					});
				}
			}
		}
	}

	console.log('info', '--------------------End User Permission Migration--------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
