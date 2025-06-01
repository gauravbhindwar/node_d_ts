import db from '@/models';
import EmployeeSalary from '@/models/employeeSalary.model';
import LoginUser from '@/models/loginUser.model';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';

(async function injectEmployeeBonusEndDate() {
	try {
		const employeeRepo = new EmployeeRepo();
		console.log(
			'info',
			'-------------------------Start Employee Salary Filter and change endDate Migration-------------------------',
		);
		// const portalDate = moment('18-12-2023', 'DD-MM-YYYY').toDate();
		const employeeData = await employeeRepo
			.getAll({
				// where: {
				// 	terminationDate: {
				// 		[Op.or]: [{ [Op.eq]: null }, { [Op.gte]: portalDate }],
				// 	},
				// },
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
						order: [['startDate', 'asc']],
					},
				],
			})
			.then((data) => parse(data));
		console.log({ length: employeeData?.length });
		const transaction = await db.transaction();
		try {
			let count = 0;
			const employeeIds = [];
			for (const data of employeeData) {
				if (
					data?.employeeSalary?.length > 1 &&
					data?.id !== 938 &&
					data?.id !== 971 &&
					data?.id !== 555 &&
					data?.id !== 924 &&
					data?.id !== 1321
				) {
					count += 1;
					employeeIds?.push(data?.id);
					for (const employeeSalaryIndex in data?.employeeSalary) {
						if (+employeeSalaryIndex !== data?.employeeSalary?.length - 1) {
							await EmployeeSalary.update(
								{
									endDate: moment(
										moment(data?.employeeSalary[+employeeSalaryIndex + 1]?.startDate).format('DD-MM-YYYY'),
										'DD-MM-YYYY',
									)
										.subtract(1, 'day')
										.toDate(),
								},
								{ where: { id: data?.employeeSalary[employeeSalaryIndex].id }, transaction },
							);
						}
					}
				}
			}
			await transaction.commit();
			console.log({ count });
			console.log({ employeeIds: JSON.stringify(employeeIds) });
		} catch (error) {
			await transaction.rollback();
			console.log({ error });
		}
	} catch (error) {
		console.log({ error });
	}
	console.log(
		'info',
		'-------------------------End Employee Salary Filter and change endDate Migration-------------------------',
	);
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
