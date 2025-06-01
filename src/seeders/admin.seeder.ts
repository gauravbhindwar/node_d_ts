/* eslint-disable no-console */
import { status } from '@/interfaces/model/user.interface';
import Feature from '@/models/feature.model';
import LoginUser from '@/models/loginUser.model';
import Permission from '@/models/permission.model';
import Role from '@/models/role.model';
import UserPermission from '@/models/userPermission.model';
import LoginUserRepo from '@/repository/loginUser.repository';
import UserRepo from '@/repository/user.repository';
import { Op } from 'sequelize';

const users = [
	{
		email: 'admin@gmail.com',
		name: 'Test User',
		password: 'Admin@123',
		status: status.ACTIVE,
		profileImage: '',
		role: 'super admin',
		isMailNotification: false,
	},
];

//==============Import Admin User On Database=============
(async function injectUsers(): Promise<void> {
	const userRepo = new UserRepo();
	const loginUserRepo = new LoginUserRepo();
	for (const user of users) {
		//Check user already exist or not
		const userExist = await userRepo.get({ include: [{ model: LoginUser, where: { email: user.email } }] });
		let roleId = null;
		let loginUserId = null;
		if (!userExist) {
			const findRole = await Role.findOne({
				where: {
					name: user.role,
				},
			});
			roleId = findRole ? findRole.id : 1;
			const loginUserData = await loginUserRepo.create({
				email: user.email,
				name: user.name,
				isMailNotification: user.isMailNotification,
				password: user.password,
				profileImage: user.profileImage,
			});
			if (loginUserData) {
				await userRepo.create({
					loginUserId: loginUserData.id,
					roleId: findRole ? findRole.id : 1,
					status: user.status,
				});
				loginUserId = loginUserData.id;
			}
		} else {
			roleId = userExist.roleId;
			loginUserId = userExist.loginUserId;
		}

		const featuresData = await Feature.findAll({
			include: { model: Permission },
		});
		const permissionIds: number[] = [];
		if (featuresData.length > 0) {
			for (const featData of featuresData) {
				for (const permission of featData.permissions) {
					const isExist = await UserPermission.findOne({
						where: { loginUserId: loginUserId, roleId: roleId, permissionId: permission.id },
					});
					if (!isExist) {
						const result = await UserPermission.create({
							loginUserId: loginUserId,
							roleId: roleId,
							permissionId: permission.id,
						});
						permissionIds.push(result.id);
					} else {
						permissionIds.push(isExist.id);
					}
				}
			}
			permissionIds.length &&
				(await UserPermission.destroy({
					where: { loginUserId: loginUserId, roleId: roleId, id: { [Op.notIn]: permissionIds } },
				}));
		}
	}
})()
	.then(async () => {
		console.log('info', 'User Added Successfully.....');
	})
	.catch((err) => {
		console.log('info', err.message);
	});
