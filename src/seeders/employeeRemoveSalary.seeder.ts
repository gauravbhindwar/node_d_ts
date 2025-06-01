import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Employee Salary Remove Data
		const isExist = await Employee.findAll({
			where: {
				deletedAt: null,
			},
			include: [
				{
					model: EmployeeSalary,
					order: [
						['startDate', 'desc'],
						['id', 'desc'],
					],
				},
			],
			transaction,
		}).then((data) => parse(data));

		const employeeSalaryData = [];
		const employeeUpdateData = [];
		if (isExist) {
			for (const iterator of isExist) {
				const item = iterator?.employeeSalary.findIndex((itemD) => itemD?.dailyCost === 0);
				if (item && item > 0) {
					employeeUpdateData.push(iterator?.employeeSalary[item - 1]?.id);
					for (let index = item; index < iterator?.employeeSalary?.length; index++) {
						employeeSalaryData.push(iterator?.employeeSalary[index]?.id);
					}
				}
			}
			await EmployeeSalary.destroy({
				where: {
					id: {
						[Op.in]: employeeSalaryData,
					},
				},
			});

			await EmployeeSalary.update(
				{ endDate: null },
				{
					where: {
						id: {
							[Op.in]: employeeUpdateData,
						},
					},
				},
			);
			console.log(employeeSalaryData, 'employeeSalaryData');
			console.log(employeeUpdateData, 'employeeUpdateData');
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Salary Removed Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
