import db from '@/models';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Employee Termination Date Change Data
		const isExist = await Employee.findAll({
			where: {
				terminationDate: {
					[Op.between]: [moment('2023-12-18', 'YYYY-MM-DD').toDate(), moment('2024-01-28', 'YYYY-MM-DD').toDate()],
				},
				deletedAt: null,
			},
			include: [
				{
					model: Timesheet,
				},
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName'],
				},
				{
					model: Client,
					attributes: ['id'],
					include: [
						{
							model: LoginUser,
							attributes: ['name'],
						},
					],
				},
			],
			transaction,
		}).then((data) => parse(data));

		const filteredData = isExist.filter(
			(e) =>
				e.id !== 1089 &&
				e.id !== 1433 &&
				e.id !== 1441 &&
				e.id !== 1378 &&
				e.id !== 675 &&
				e.id !== 162 &&
				e.id !== 247 &&
				e.id !== 1329 &&
				e.id !== 1411 &&
				e.id !== 854,
		);

		// const addFilteredData = isExist.filter(
		// 	(e) => e.id === 675 || e.id === 162 || e.id === 247 || e.id === 1329 || e.id === 1411,
		// );
		for (const iterator of filteredData) {
			const terminationDate = moment(moment(iterator.terminationDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			const timesheetScheduleDate = moment(terminationDate).add(1, 'day').toDate();
			await TimesheetSchedule.update(
				{
					deletedAt: null,
				},
				{
					where: {
						employeeId: iterator.id,
						date: {
							[Op.eq]: timesheetScheduleDate,
						},
					},
					paranoid: false,
				},
			);

			await Employee.update({ terminationDate: timesheetScheduleDate }, { where: { id: iterator.id } });
			console.log('Updated', iterator.id, ' employee');
		}

		// for (const addData of addFilteredData) {
		// 	const terminationDate = moment(moment(addData.terminationDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
		// 	const timesheetScheduleDate = moment(terminationDate).add(1, 'day').toDate();
		// 	await TimesheetSchedule.create({
		// 		employeeId: addData.id,
		// 		date: timesheetScheduleDate,
		// 		status: 'P',
		// 		bonusCode: null,
		// 		createdBy: null,
		// 		dbKey: `${moment(timesheetScheduleDate).format('DDMMYYYY')}${addData.id}`,
		// 	});
		// 	await Employee.update({ terminationDate: timesheetScheduleDate }, { where: { id: addData.id } });
		// 	console.log('Updated', addData.id, ' employee');
		// }
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Termination Date Change Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
