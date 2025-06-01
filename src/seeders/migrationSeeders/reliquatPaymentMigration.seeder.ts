import ReliquatPayment from '@/models/reliquatPayment.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IReliquatPaymentData {
	Id: string;
	EmployeeId: string;
	CalendarDate: Date | string;
	AdditionalPTotal: number;
}

(async function injectReliquatPayment() {
	const result = await mssqldb.query(
		'SELECT Id,EmployeeId,CalendarDate,AdditionalPTotal FROM rd_Time WHERE AdditionalPTotal IS NOT NULL',
	);
	console.info('info', '------------------------- Start Reliquat Payment Migration -------------------------');

	if (result.length) {
		for (const data of result[0] as IReliquatPaymentData[]) {
			try {
				const isExistEmployee = await employeeRepo.get({
					where: { oldEmployeeId: data.EmployeeId, deletedAt: null },
				});
				if (isExistEmployee) {
					const isExistReliquatPayment = await ReliquatPayment.findOne({
						where: {
							startDate: moment(data.CalendarDate).toDate(),
							clientId: isExistEmployee.clientId,
							employeeId: isExistEmployee.id,
						},
					});
					if (!isExistReliquatPayment) {
						const ReliquatPaymentData = {
							clientId: isExistEmployee.clientId,
							employeeId: isExistEmployee.id,
							amount: data.AdditionalPTotal,
							startDate: moment(data.CalendarDate).toDate(),
						};
						await ReliquatPayment.create(ReliquatPaymentData);
					}
				}
			} catch (error) {
				console.error('ERROR', error);
			}
		}
	}
	console.info('info', '-------------------------End Reliquat Payment Migration-------------------------');
	// End Reliquat Payment Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
