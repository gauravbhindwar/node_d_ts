import db from '@/models';
import EmployeeSalary from '@/models/employeeSalary.model';
import LoginUser from '@/models/loginUser.model';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectEmployeeSalaryEndTerminationDate() {
	try {
		const employeeRepo = new EmployeeRepo();
		console.log(
			'info',
			'-------------------------Start Employee Salary End Date Change to termination Date Migration-------------------------',
		);
		// const portalDate = moment('18-12-2023', 'DD-MM-YYYY').toDate();
		const employeeData = await employeeRepo
			.getAll({
				where: {
					terminationDate: {
						[Op.ne]: null,
					},
				},
				attributes: ['id', 'terminationDate'],
				include: [
					{
						model: LoginUser,
						attributes: ['id', 'firstName', 'lastName'],
					},
					{
						model: EmployeeSalary,
						attributes: ['id', 'employeeId', 'baseSalary', 'monthlySalary', 'dailyCost', 'startDate', 'endDate'],
						separate: true,
						required: true,
						order: [['startDate', 'asc']],
					},
				],
			})
			.then((data) => parse(data));
		let count = 0;
		console.log({ employeeCount: employeeData?.length });
		const transaction = await db.transaction();
		try {
			for (const data of employeeData) {
				if (data?.employeeSalary[data?.employeeSalary?.length - 1]?.endDate === null) {
					count += 1;
					const updateSalaryId = data?.employeeSalary[data?.employeeSalary?.length - 1]?.id;
					await EmployeeSalary.update(
						{
							endDate: moment(moment(data.terminationDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						},
						{ where: { id: updateSalaryId, endDate: null }, transaction },
					);
				}
			}
			await transaction.commit();
			console.log({ count });
		} catch (error) {
			console.log({ error });
			await transaction.rollback();
		}
	} catch (error) {
		console.log({ error });
	}
	console.log(
		'info',
		'-------------------------End Employee Salary End Date Change to termination Date Migration-------------------------',
	);
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
