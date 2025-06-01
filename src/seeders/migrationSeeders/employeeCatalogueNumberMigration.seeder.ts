import EmployeeCatalogueNumber from '@/models/employeeCatalogueNumber.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';

const employeeRepo = new EmployeeRepo();

(async function injectMessage() {
	console.info('info', '------------------------- Start Employee Catalogue No Migration -------------------------');

	const result = await mssqldb.query('SELECT * FROM rd_EmployeeCatalogueNo');

	const empArr = new Map();

	if (result.length) {
		for (const data of result[0] as any) {
			if (data.EmployeeId && !empArr.get(data.EmployeeId)) {
				const empData = await employeeRepo
					.get({ attributes: ['id', 'clientId', 'startDate'], where: { oldEmployeeId: data.EmployeeId } })
					.then((parserData) => parse(parserData));
				empArr.set(data.EmployeeId, empData);
			}

			await EmployeeCatalogueNumber.create({
				employeeId: data.EmployeeId ? empArr?.get(data.EmployeeId)?.id : null,
				catalogueNumber: data.CatalogueNo ? data.CatalogueNo : null,
				startDate: data.StartDate ? data.StartDate : null,
			});
		}
	}
	console.info('info', '-------------------------End Employee Catalogue No Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
