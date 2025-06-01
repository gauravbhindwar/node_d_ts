import ReliquatAdjustment from '@/models/reliquatAdjustment.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IReliquatAdjustmentData {
	Id: string;
	EmployeeId: string;
	TimesheetStartDate: Date | string;
	TotalAdjustment: number;
}

(async function injectReliquatAdjustment() {
	const result = await mssqldb.query(
		'SELECT rd_TimesheetEmployee.*,rd_Timesheet.StartDate as TimesheetStartDate FROM rd_TimesheetEmployee INNER JOIN rd_Timesheet ON rd_Timesheet.Id=rd_TimesheetEmployee.TimesheetId WHERE rd_TimesheetEmployee.TotalAdjustment IS NOT NULL',
	);
	console.info('info', '------------------------- Start Reliquat Adjustment Migration -------------------------');

	if (result.length) {
		for (const data of result[0] as IReliquatAdjustmentData[]) {
			try {
				const isExistEmployee = await employeeRepo.get({
					where: { oldEmployeeId: data.EmployeeId, deletedAt: null },
				});
				if (isExistEmployee) {
					const isExistReliquatAdjustment = await ReliquatAdjustment.findOne({
						where: {
							startDate: moment(data.TimesheetStartDate).toDate(),
							clientId: isExistEmployee.clientId,
							employeeId: isExistEmployee.id,
						},
					});
					if (!isExistReliquatAdjustment) {
						const reliquatAdjustmentData = {
							clientId: isExistEmployee.clientId,
							employeeId: isExistEmployee.id,
							adjustment: data.TotalAdjustment,
							startDate: moment(data.TimesheetStartDate).toDate(),
						};
						await ReliquatAdjustment.create(reliquatAdjustmentData);
					}
				}
			} catch (error) {
				console.error('ERROR', error);
			}
		}
	}
	console.info('info', '-------------------------End Reliquat Adjustment Migration-------------------------');
	// End Reliquat Adjustment Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
