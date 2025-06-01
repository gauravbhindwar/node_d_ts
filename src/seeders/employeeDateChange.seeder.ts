import db from '@/models';
import Employee from '@/models/employee.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Employee Date Change Data
		const isExist = await Employee.findAll({
			where: {
				startDate: {
					[Op.between]: ['2023-12-18 05:30:00+05:30', '2024-01-28 05:30:00+05:30'],
				},
				clientId: {
					[Op.notIn]: [30, 54],
				},
				deletedAt: null,
			},
			include: [
				{
					model: Timesheet,
				},
			],
			transaction,
		}).then((data) => parse(data));
		
		const filteredEmployees = isExist.filter((iterator) => iterator.id !== 1454 && iterator.id !== 1434);

		const timesheetEmployeeData = isExist.filter((iterator) => iterator.id === 1435);

		for (const iterator of filteredEmployees) {
			const updateStartDate = moment(moment(iterator.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();

			await TimesheetSchedule.create({
				employeeId: iterator.id,
				date: moment(updateStartDate, 'YYYY-MM-DD').toDate(),
				status: 'P',
				bonusCode: null,
				createdBy: null,
				dbKey: `${moment(updateStartDate).format('DDMMYYYY')}${iterator.id}`,
			});

			await Employee.update(
				{
					startDate: moment(moment(iterator.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
				},
				{
					where: {
						id: iterator.id,
					},
				},
			);
		}

		await Timesheet.create({
			employeeId: timesheetEmployeeData[0]?.id,
			startDate: moment('2023-11-26T00:00:00.000Z').toDate(),
			endDate: moment('2023-12-25T00:00:00.000Z').toDate(),
			segmentId: timesheetEmployeeData[0]?.segmentId,
			subSegmentId: null,
			clientId: timesheetEmployeeData[0]?.clientId,
			dbKey: `${moment(timesheetEmployeeData[0]?.startDate, 'YYYY-MM-DD').format('DDMMYYYY')}${
				timesheetEmployeeData[0]?.segmentId
			}${timesheetEmployeeData[0]?.id}`,
			deletedAt: null,
			status: 'UNAPPROVED',
			oldTimesheetId: null,
			approvedAt: null,
			approvedBy: null,
			unApprovedAt: null,
			unApprovedBy: null,
			updatedBy: null,
		});
		
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Date Change Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
