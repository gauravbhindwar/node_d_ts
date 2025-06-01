import TimesheetSchedule from '@/models/timesheetSchedule.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

(async function injectTimesheet() {
	console.info('info', '------------------------- Start Timesheet Schedule Migration -------------------------');

	const employees = await mssqldb.query(`SELECT
	rt.EmployeeId
FROM
	rd_Time rt
left JOIN rd_TimeStatus rts ON
	rt.StatusId = rts.Id
left JOIN rd_BonusType rbt ON
	rt.BonusTypeId = rbt.Id OR rt.BonusType2Id = rbt.id
where rt.StatusId < 9 
GROUP by rt.EmployeeId;`);

	const empNotFound = [];
	const timesheetInsertError = [];
	let insertArrquery = [];
	const insertArrqueryAll = [];
	if (employees.length) {
		for (const data of employees[0] as any[]) {
			const result = await mssqldb.query(`
				SELECT
				rt.EmployeeId,
				rt.CalendarDate,
				rt.StatusId,
				rts.Code AS attendanceCode,
				rbt.Code AS bonusCode,
				rt.BonusTypeId,
				rt.BonusType2Id,
				rt.WeekendBonus as weekendBonus, 
				rt.OvertimeABonus as overtimeBonus1, 
				rt.OvertimeBBonus as overtimeBonus2 
				FROM
					rd_Time rt
				LEFT JOIN rd_TimeStatus rts ON
					rt.StatusId = rts.Id
				LEFT JOIN rd_BonusType rbt ON
					rt.BonusTypeId = rbt.Id OR rt.BonusType2Id = rbt.id
				WHERE rt.StatusId < 9 AND rt.EmployeeId = '${data.EmployeeId}'
			`);
			const empData = await employeeRepo
				.get({ attributes: ['id'], where: { oldEmployeeId: data.EmployeeId } })
				.then((dat) => parse(dat));

			if (result.length && empData) {
				for (const insertArr of result[0] as any[]) {
					try {
						// await TimesheetSchedule.create({
						// 	employeeId: Number(empData.id),
						// 	date: moment(insertArr.CalendarDate, 'YYYY-MM-DD').toDate(),
						// 	status: insertArr.attendanceCode || '',
						// 	bonusCode:
						// 		`${insertArr.bonusCode || ''}${insertArr.weekendBonus > 0 ? (insertArr.bonusCode ? ',W' : 'W') : ''}${
						// 			insertArr.overtimeBonus1 > 0 ? (insertArr.bonusCode ? ',O1' : 'O1') : ''
						// 		}${insertArr.overtimeBonus2 > 0 ? (insertArr.bonusCode ? ',O2' : 'O2') : ''}` || null,
						// 	createdBy: null,
						// 	dbKey: `${moment(insertArr.CalendarDate).format('DDMMYYYY')}${empData.id}`,
						// });
						insertArrquery.push({
							employeeId: Number(empData.id),
							date: moment(insertArr.CalendarDate, 'YYYY-MM-DD').toDate(),
							status: insertArr.attendanceCode || '',
							bonusCode:
								`${insertArr.bonusCode || ''}${insertArr.weekendBonus > 0 ? (insertArr.bonusCode ? ',W' : 'W') : ''}${
									insertArr.overtimeBonus1 > 0 ? (insertArr.bonusCode ? ',O1' : 'O1') : ''
								}${insertArr.overtimeBonus2 > 0 ? (insertArr.bonusCode ? ',O2' : 'O2') : ''}` || null,
							createdBy: null,
							dbKey: `${moment(insertArr.CalendarDate).format('DDMMYYYY')}${empData.id}`,
						});
						insertArrqueryAll.push({
							employeeId: Number(empData.id),
							date: moment(insertArr.CalendarDate, 'YYYY-MM-DD').toDate(),
							status: insertArr.attendanceCode || '',
							bonusCode:
								`${insertArr.bonusCode || ''}${insertArr.weekendBonus > 0 ? (insertArr.bonusCode ? ',W' : 'W') : ''}${
									insertArr.overtimeBonus1 > 0 ? (insertArr.bonusCode ? ',O1' : 'O1') : ''
								}${insertArr.overtimeBonus2 > 0 ? (insertArr.bonusCode ? ',O2' : 'O2') : ''}` || null,
							createdBy: null,
							dbKey: `${moment(insertArr.CalendarDate).format('DDMMYYYY')}${empData.id}`,
						});
					} catch (error) {
						timesheetInsertError.push(error);
					}
				}
				await TimesheetSchedule.bulkCreate(insertArrquery, {
					ignoreDuplicates: true,
				});
				insertArrquery = [];
			} else {
				empNotFound.push(data.EmployeeId);
			}
		}
		console.log('empNotFound', JSON.stringify(empNotFound));
		console.log('timesheetInsert', JSON.stringify(timesheetInsertError));
		console.log('all length : ', empNotFound.length, timesheetInsertError.length);
		console.log('insertArrqueryAll : ', insertArrqueryAll?.length);
	}
	console.info('info', '-------------------------End Timesheet Schedule Migration-------------------------');
	// End Client Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
