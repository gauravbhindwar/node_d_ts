import Employee from '@/models/employee.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import TimesheetRepo from '@/repository/timesheet.repository';
import { Op } from 'sequelize';

const timesheetRepo = new TimesheetRepo();

(async function injectExtraTimesheet() {
	// Delete Timesheet Data
	const result = await timesheetRepo.getAll({
		include: [{ model: Employee, where: { terminationDate: { [Op.not]: null } } }],
		order: [['id', 'asc']],
	});
	console.log('info', '------------------------- Start Delete Extra Timesheet Data -------------------------');
	if (result.length) {
		for (const data of result) {
			if (data.startDate > data.employee.terminationDate) {
				await timesheetRepo.deleteData({ where: { id: data.id } });
			}
		}
	}

	// Delete Timesheet Schedule Data
	const timesheetScheduleResult = await TimesheetSchedule.findAll({
		include: [{ model: Employee, where: { terminationDate: { [Op.not]: null } } }],
		order: [['id', 'asc']],
	});
	if (timesheetScheduleResult.length) {
		for (const data of timesheetScheduleResult) {
			if (data.date > data.employee.terminationDate) {
				await TimesheetSchedule.destroy({ where: { id: data.id } });
			}
		}
	}
	console.log('info', '------------------------- End Delete Extra Timesheet Data -------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
