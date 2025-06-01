import Role from '../models/role.model';
import RolePermission from '../models/rolePermission.model';
import UserPermission from '../models/userPermission.model';
import UserRepo from '../repository/user.repository';

(async function injectSettings(): Promise<void> {
	const userRepo = new UserRepo();
	const userData = await userRepo.getAll({ include: [{ model: Role, where: { name: 'Users' } }] });
	const userPermisssion = await RolePermission.findAll({
		include: [{ model: Role, where: { name: 'Users' } }],
	});
	for (const users of userData) {
		for (const permission of userPermisssion) {
			const isExist = await UserPermission.findOne({
				where: {
					roleId: users.roleId,
					loginUserId: users.loginUserId,
					permissionId: permission.permissionId,
					deletedAt: null,
				},
			});
			if (!isExist) {
				await UserPermission.create({
					roleId: users.roleId,
					loginUserId: users.loginUserId,
					permissionId: permission.permissionId,
				});
			}
		}
	}
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('info', 'Update User Permission successfully...');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('error', err.message);
	});
