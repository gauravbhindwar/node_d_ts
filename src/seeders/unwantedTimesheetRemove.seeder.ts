import Account from '@/models/account.model';
import AccountPO from '@/models/accountPO.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import ReliquatCalculationV2 from '@/models/reliquatCalculationV2.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetLogs from '@/models/timesheetLogs.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import ClientRepo from '@/repository/client.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectEmployeeSalaryEndTerminationDate() {
	try {
		const clientRepo = new ClientRepo();
		console.log(
			'info',
			'-------------------------Start removing Extra Timesheet after client date Migration-------------------------',
		);
		const clientData = await clientRepo
			.getAll({
				paranoid: false,
				include: [
					{
						model: LoginUser,
						attributes: ['name'],
					},
				],
			})
			.then((data) => parse(data));
		let finalTimesheetIds = [];
		let finalTimesheetScheduleIds = [];
		for (const client of clientData) {
			try {
				const timesheetIds = [];
				const timesheetData = await Timesheet.findAll({
					where: {
						startDate: {
							[Op.gt]: moment(client?.endDate).toDate(),
						},
						clientId: client.id,
					},
					attributes: ['id', 'startDate'],
				}).then((data) => parse(data));
				if (timesheetData?.length > 0) {
					timesheetData.map((e) => timesheetIds.push(e?.id));
					if (timesheetIds?.length > 0) {
						await Account.destroy({
							where: {
								timesheetId: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
						await AccountPO.destroy({
							where: {
								timesheetId: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
						const timesheetScheduleData = await TimesheetSchedule.findAll({
							where: {
								date: {
									[Op.gt]: moment(client.endDate).add(1, 'day').toDate(),
								},
							},
							paranoid: false,
							include: [
								{
									model: Employee,
									required: true,
									attributes: ['id'],
									where: {
										clientId: client.id,
									},
								},
							],
						}).then((e) => parse(e));
						if (timesheetScheduleData?.length > 0) {
							const scheduleIds = timesheetScheduleData?.map((e) => e?.id);
							await TimesheetSchedule.destroy({
								where: {
									id: {
										[Op.in]: scheduleIds,
									},
								},
								force: true,
							});
							finalTimesheetScheduleIds = [...finalTimesheetScheduleIds, ...scheduleIds];
						}
						await ReliquatCalculation.destroy({
							where: {
								timesheetId: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
						await ReliquatCalculationV2.destroy({
							where: {
								timesheetId: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
						await TimesheetLogs.destroy({
							where: {
								timesheetId: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
						await Timesheet.destroy({
							where: {
								id: {
									[Op.in]: timesheetIds,
								},
							},
							force: true,
						});
					}
					finalTimesheetIds = [...finalTimesheetIds, ...timesheetIds];
				}
			} catch (error) {
				console.log({ error });
			}
		}
		console.log('finalTimesheetIds', JSON.stringify(finalTimesheetIds));
		console.log('************************************************************************************************');
		console.log('finalTimesheetScheduleIds', JSON.stringify(finalTimesheetScheduleIds));
		console.log('************************************************************************************************');
		console.log('finalTimesheetIds length', finalTimesheetIds?.length);
		console.log('finalTimesheetScheduleIds length', finalTimesheetScheduleIds?.length);
	} catch (error) {
		console.log({ error });
	}
	console.log(
		'info',
		'-------------------------End removing Extra Timesheet after client date Migration-------------------------',
	);
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
