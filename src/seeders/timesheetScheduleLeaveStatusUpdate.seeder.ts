import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import TimesheetScheduleRepo from '@/repository/timesheetSchedule.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectTimesheetScheduleLeaveStatus() {
	try {
		const timesheetScheduleRepo = new TimesheetScheduleRepo();
		console.log(
			'info',
			'-------------------------Start Timesheet Schedule Leave Status Update Migration-------------------------',
		);
		const timesheetStartDate = moment('26-03-2024', 'DD-MM-YYYY').toDate();
		const timesheetEndDate = moment('25-04-2024', 'DD-MM-YYYY').toDate();
		const timesheetScheduleData = await timesheetScheduleRepo
			.getAll({
				where: {
					date: {
						[Op.or]: {
							[Op.between]: [timesheetStartDate, timesheetEndDate],
							[Op.eq]: timesheetEndDate,
						},
					},
					isLeaveForTitreDeConge: true,
				},
				include: [
					{
						model: Employee,
						attributes: ['id', 'clientId'],
						include: [
							{
								model: Client,
								attributes: ['id'],
								where: {
									id: 15,
								},
							},
						],
					},
				],
				order: [['date', 'desc']],
			})
			.then((data) => parse(data));
		const scheduleIds = timesheetScheduleData.map((e) => e?.id);
		console.log(
			'🚀 ~ file: timesheetScheduleLeaveStatusUpdate.seeder.ts:24 ~ injectTimesheetScheduleLeaveStatus ~ timesheetScheduleData:',
			scheduleIds?.length,
			JSON.stringify(scheduleIds),
		);
		const updatedData = await timesheetScheduleRepo.update(
			{ isLeaveForTitreDeConge: false },
			{ where: { id: { [Op.in]: scheduleIds } } },
		);
		console.log({ updatedDataLength: updatedData[0] });
	} catch (error) {
		console.log({ error });
	}
	console.log(
		'info',
		'-------------------------End Timesheet Schedule Leave Status Update Migration-------------------------',
	);
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
