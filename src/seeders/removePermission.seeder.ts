import Feature from '@/models/feature.model';
import LoginUser from '@/models/loginUser.model';
import Permission from '@/models/permission.model';
import Role from '@/models/role.model';
import UserPermission from '@/models/userPermission.model';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';

(async function injectRemoveUnwantedPermissions() {
	try {
		const userRepo = new UserRepo();
		console.log(
			'info',
			'-------------------------Start Removing Unwanted Permissions Migration-------------------------',
		);
		const employeeRole = await Role.findOne({
			where: {
				name: 'Employee',
			},
			attributes: ['id'],
		});
		if (employeeRole) {
			const data = await userRepo
				.getAll({
					attributes: ['id', 'loginUserId'],
					where: {
						roleId: employeeRole?.id,
					},
					include: [
						{
							model: LoginUser,
							required: true,
							attributes: ['id'],
							include: [
								{
									model: UserPermission,
									attributes: ['id'],
									required: true,
									include: [
										{
											model: Permission,
											where: {
												permissionName: 'create',
											},
											required: true,
											attributes: ['id', 'permissionName'],
											include: [
												{
													model: Feature,
													attributes: ['id', 'name'],
													where: {
														name: {
															[Op.any]: ['Medical Request', 'Employee Leave'],
														},
													},
												},
											],
										},
									],
								},
							],
						},
					],
				})
				.then((userData) => parse(userData));
			console.log({ length: data.length });
			let removableIds = [];
			for (const iterator of data) {
				const ids = iterator?.loginUserData?.assignedUserPermission?.map((e) => e?.id);
				removableIds = [...removableIds, ...ids];
			}

			await UserPermission.destroy({
				where: {
					id: {
						[Op.in]: removableIds,
					},
				},
			});
			console.log({ removableIds: JSON.stringify(removableIds) });
			console.log({ 'RemovableIds Length': removableIds?.length });
		}
	} catch (error) {
		console.log({ error });
	}
	console.log('info', '-------------------------End Removing Unwanted Permissions Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
