import { timesheetLogsStatus } from '@/interfaces/model/timesheetLogs.interface';
import LoginUser from '@/models/loginUser.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetLogs from '@/models/timesheetLogs.model';
import mssqldb from '@/mssqldb';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';

(async function injectTimesheet() {
	console.info('info', '------------------------- Start Timesheet Log Migration -------------------------');

	const Logs = await mssqldb.query(`select * from rd_TimesheetLog rtl order by ActionDate asc`);
	const userArr = new Map();
	const userRepo = new UserRepo();
	if (Logs.length) {
		for (const data of Logs[0] as any[]) {
			if (data.UserName) {
				const userData = await userRepo
					.get({
						attributes: ['id'],
						include: [{ model: LoginUser, required: true, where: { email: data.UserName } }],
					})
					.then((parser) => parse(parser));
				userArr.set(data.UserName, userData);
			}
			const timesheetData = await Timesheet.findAll({
				attributes: ['id'],
				where: {
					oldTimesheetId: data.TimesheetId,
				},
			}).then((parser) => parse(parser));
			for (const timesheetdat of timesheetData) {
				await TimesheetLogs.create({
					actionBy: userArr.get(data.UserName)?.id || null,
					timesheetId: timesheetdat?.id || null,
					status: data.StatusId == 2 ? timesheetLogsStatus.APPROVED : timesheetLogsStatus.UNAPPROVED,
					actionDate: moment(data.ActionDate).toDate(),
				});
			}
		}
	}
	console.info('info', '-------------------------End Timesheet Log Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
