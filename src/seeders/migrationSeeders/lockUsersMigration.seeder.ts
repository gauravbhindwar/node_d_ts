import { status } from '@/interfaces/model/user.interface';
import LoginUser from '@/models/loginUser.model';
import mssqldb from '@/mssqldb';
import ClientRepo from '@/repository/client.repository';
import EmployeeRepo from '@/repository/employee.repository';
import UserRepo from '@/repository/user.repository';
import { Op } from 'sequelize';

const userRepo = new UserRepo();
const employeeRepo = new EmployeeRepo();
const clientRepo = new ClientRepo();

interface lockedUserDataInterface {
	Id: string;
	ClientId: string;
	SegmentId: string | null;
	SubSegmentId: string | null;
	EmployeeId: string | null;
	Email: string;
	EmailConfirmed: boolean;
	LockoutEndDateUtc: string;
}

(async function injectLockedUsers() {
	console.info('info', '------------------------- Start Locked User Migration -------------------------');
	const lockedUserData = await mssqldb.query(`SELECT
	Id,
	ClientId,
	SegmentId,
	SubSegmentId,
	EmployeeId,
	Email,
	EmailConfirmed,
	LockoutEndDateUtc
	FROM
	dbo.AspNetUsers
	WHERE LockoutEndDateUtc IS NOT NULL;`);

	const errorArray = [];

	const updateUsers = async (data) => {
		const userIds = data?.map((userData) => {
			return userData?.id;
		});
		console.log('userIds length:', userIds, userIds?.length);

		if (userIds?.length > 0) {
			await userRepo.update(
				{ status: status?.INACTIVE },
				{
					where: {
						id: {
							[Op.in]: userIds,
						},
					},
				},
			);
		}
	};

	try {
		console.log('Normal Users');
		for (const data of lockedUserData[0] as lockedUserDataInterface[]) {
			const isExistEmail = await userRepo.getAll({
				attributes: ['id'],
				include: [
					{
						model: LoginUser,
						required: true,
						attributes: ['id', 'email'],
						where: {
							email: data.Email,
						},
					},
				],
			});

			await updateUsers(isExistEmail);
		}

		console.log('Terminated Employees User');

		const employeeData = await employeeRepo.getAll({
			where: {
				terminationDate: { [Op.or]: { [Op.ne]: null, [Op.lte]: new Date() } },
			},
			attributes: ['id'],
			include: [
				{
					model: LoginUser,
					required: true,
					attributes: ['id', 'email'],
					where: {
						email: {
							[Op.ne]: null,
						},
					},
				},
			],
		});

		if (employeeData?.length > 0) {
			const terminatedEmployeeIds = employeeData?.map((terminatedEmployeeData) => {
				return terminatedEmployeeData?.loginUserData?.id;
			});

			const employeeUserData = await userRepo.getAll({
				where: {
					loginUserId: {
						[Op.in]: terminatedEmployeeIds,
					},
					status: status?.ACTIVE,
				},
				include: [
					{
						model: LoginUser,
					},
				],
			});
			if (employeeUserData?.length > 0) {
				await updateUsers(employeeUserData);
			}
		}

		console.log('In-Active Clients Users');

		const clientData = await clientRepo.getAll({
			where: {
				isActive: false,
			},
			attributes: ['id'],
			include: [
				{
					model: LoginUser,
					required: true,
					attributes: ['id', 'email'],
					where: {
						email: {
							[Op.ne]: null,
						},
					},
				},
			],
		});

		if (clientData?.length > 0) {
			const inActiveClientIds = clientData?.map((inActiveClientData) => {
				return inActiveClientData?.loginUserData?.id;
			});

			const clientUserData = await userRepo?.getAll({
				where: {
					loginUserId: {
						[Op.in]: inActiveClientIds,
					},
					status: status?.ACTIVE,
				},
			});
			if (clientUserData?.length > 0) {
				await updateUsers(clientUserData);
			}
		}
	} catch (error) {
		console.log('error', error);
		errorArray.push(error);
	}

	console.log('errorArray', errorArray);

	console.info('info', '------------------------- End Locked User Migration -------------------------');
})().catch((err) => {
	console.log('error', err.message);
});
