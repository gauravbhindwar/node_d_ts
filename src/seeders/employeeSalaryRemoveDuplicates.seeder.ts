import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import LoginUser from '@/models/loginUser.model';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For removing employee salary duplicate data
		const employeeData = await Employee.findAll({
			where: {
				deletedAt: null,
				clientId: {
					[Op.notIn]: [30, 54],
				},
			},
			attributes: ['id'],
			include: [
				{
					model: EmployeeSalary,
					required: true,
					attributes: ['id', 'employeeId', 'startDate', 'endDate', 'baseSalary', 'monthlySalary', 'dailyCost'],
				},
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName'],
				},
			],
			order: [
				['employeeSalary', 'startDate', 'desc'],
				['employeeSalary', 'endDate', 'desc'],
			],
			transaction,
		}).then((data) => parse(data));
		const finalRemovableIds = [];
		for (const data of employeeData) {
			if (data?.employeeSalary?.length > 1) {
				const salaryMap = new Map();
				for (const salaryData of data.employeeSalary) {
					const isExist = salaryMap.get(salaryData.startDate);
					if (!isExist) {
						salaryMap?.set(salaryData.startDate, salaryData.startDate);
					} else {
						finalRemovableIds.push(salaryData.id);
					}
				}
			}
		}
		console.log(finalRemovableIds, { length: finalRemovableIds?.length });
		const removedIdLength = await EmployeeSalary.destroy({
			where: {
				id: {
					[Op.in]: finalRemovableIds,
				},
			},
			transaction,
		});
		console.log('destroyed data length', removedIdLength);
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee salary duplicate data removed Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
