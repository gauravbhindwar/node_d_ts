import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Employee Start Date add one day
		const employeeIds = [1444, 1445, 1435, 1463, 1436, 1462, 1438, 1457, 1439, 1450];

		const isExist = await Employee.findAll({
			where: {
				id: {
					[Op.in]: employeeIds,
				},
			},
			include: [
				{
					model: Timesheet,
					paranoid: false,
				},
			],
			order: [['id', 'asc']],
			paranoid: false,
			transaction,
		}).then((data) => parse(data));

		console.log('Total Employees', isExist?.length);

		for (const data of isExist) {
			console.log('🚀 ~ employeeId:', data?.id);
			const existingStartDate = moment(moment(data?.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			console.log('🚀 ~ existingStartDate:', existingStartDate);
			const updateStartDate = moment(moment(data?.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').add(1, 'day').toDate();
			console.log('🚀 ~ updateStartDate:', updateStartDate);
			await Employee.update(
				{
					startDate: updateStartDate,
				},
				{
					where: {
						id: data?.id,
					},
					paranoid: false,
					transaction,
				},
			);
			const isExistTimesheetSchedule = await TimesheetSchedule.findOne({
				where: {
					date: existingStartDate,
					employeeId: data?.id,
				},
				transaction,
			});
			if (isExistTimesheetSchedule) {
				await TimesheetSchedule.destroy({
					where: {
						id: isExistTimesheetSchedule.id,
					},
					transaction,
				});
				console.log('Timesheet Schedule Destroyed');
			}
			const isExistEmployeeRotation = await EmployeeRotation.findOne({
				where: {
					employeeId: data?.id,
					// date: existingStartDate,
				},
				transaction,
			});
			if (isExistEmployeeRotation) {
				await EmployeeRotation.update(
					{ date: updateStartDate },
					{
						where: {
							id: isExistEmployeeRotation.id,
						},
						transaction,
					},
				);
				console.log('Employee Rotation Updated');
			}
			const isExistEmployeeSegment = await EmployeeSegment.findOne({
				where: {
					employeeId: data?.id,
					// date: existingStartDate,
				},
				transaction,
			});
			if (isExistEmployeeSegment) {
				await EmployeeSegment.update(
					{ date: updateStartDate },
					{
						where: {
							id: isExistEmployeeSegment.id,
						},
						transaction,
					},
				);
				console.log('Employee Segment Updated');
			}
			if (data?.id !== 1463) {
				const isExistEmployeeSalary = await EmployeeSalary.findOne({
					where: {
						employeeId: data?.id,
						// startDate: {
						// 	[Op.between]: [
						// 		moment(existingStartDate).startOf('day').toDate(),
						// 		moment(existingStartDate).endOf('day').toDate(),
						// 	],
						// },
						endDate: null,
					},
					transaction,
				});
				if (isExistEmployeeSalary) {
					await EmployeeSalary.update(
						{ startDate: updateStartDate },
						{
							where: {
								id: isExistEmployeeSalary.id,
							},
							transaction,
						},
					);
				}
				console.log('Employee Salary Updated');
			} else {
				const isExistEmployeeSalary = await EmployeeSalary.findOne({
					where: {
						employeeId: data?.id,
						startDate: {
							[Op.between]: [
								moment(existingStartDate).startOf('day').toDate(),
								moment(existingStartDate).endOf('day').toDate(),
							],
						},
						endDate: {
							[Op.ne]: null,
						},
					},
					transaction,
				});
				if (isExistEmployeeSalary) {
					await EmployeeSalary.destroy({
						where: {
							id: isExistEmployeeSalary?.id,
						},
						transaction,
					});
					console.log('Employee Salary Destroyed');
				}
			}

			console.log('**********************************************************************************************');
		}

		const isExistTimesheet = await Timesheet.findOne({
			where: {
				employeeId: 1435,
				startDate: moment('2023-11-26T00:00:00.000Z').toDate(),
				endDate: moment('2023-12-25T00:00:00.000Z').toDate(),
			},
			transaction,
		});
		if (isExistTimesheet) {
			await Timesheet.destroy({
				where: {
					id: isExistTimesheet?.id,
				},
				transaction,
			});
			console.log('1435 employee timesheet destroyed successfully');
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Start Date add one day done successfully...');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
