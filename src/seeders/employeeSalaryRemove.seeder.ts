import db from '@/models';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectEmployeeBonusEndDate() {
	try {
		const employeeRepo = new EmployeeRepo();
		console.log('info', '-------------------------Start Employee Salary Remove Migration-------------------------');
		let employeeData = await employeeRepo.getAll({
			attributes: ['id'],
			paranoid: false,
			order: [
				['id', 'asc'],
				['employeeSalary', 'startDate', 'asc'],
				['employeeSalary', 'endDate', 'asc'],
			],
			include: [
				{
					model: EmployeeSalary,
					attributes: ['id', 'employeeId', 'baseSalary', 'monthlySalary', 'dailyCost', 'startDate', 'endDate'],
					required: true,
				},
			],
			where: {
				id: {
					[Op.notIn]: [
						26, 237, 365, 475, 555, 627, 637, 713, 769, 782, 924, 928, 971, 980, 1084, 1108, 1177, 1238, 1285, 1306,
						1316, 1321, 1360, 1381, 1414, 1426,
					],
				},
			},
		});
		employeeData = parse(employeeData);
		const transaction = await db.transaction();
		try {
			let count = 0;
			const removalbleIds = [];
			const updatedIds = [];
			for (const data of employeeData) {
				if (data?.employeeSalary?.length > 1) {
					const employeeSalaryArr = data?.employeeSalary;
					const removableData = [];
					for (const index in employeeSalaryArr) {
						if (+index > 0) {
							if (
								employeeSalaryArr[+index]?.baseSalary === employeeSalaryArr[+index - 1]?.baseSalary &&
								employeeSalaryArr[+index]?.monthlySalary === employeeSalaryArr[+index - 1]?.monthlySalary &&
								employeeSalaryArr[+index]?.dailyCost === employeeSalaryArr[+index - 1]?.dailyCost
							) {
								const endDate =
									employeeSalaryArr?.length - 1 === +index
										? null
										: moment(moment(employeeSalaryArr[+index + 1].startDate).format('DD/MM/YYYY'), 'DD/MM/YYYY')
												.subtract(1, 'day')
												.toDate();
								removableData.push({ id: employeeSalaryArr[+index].id, endDate: endDate });
								removalbleIds.push(employeeSalaryArr[+index].id);
							}
						}
					}
					if (removableData?.length > 0) {
						removableData?.reverse();
						for (const removeData of removableData) {
							const findIndex = employeeSalaryArr?.findIndex((e) => e.id === removeData.id);
							if (findIndex > 0) {
								employeeSalaryArr[findIndex - 1].endDate = employeeSalaryArr[findIndex].endDate;
								employeeSalaryArr.splice(findIndex, 1);
							}
						}
						for (const updateData of employeeSalaryArr) {
							await EmployeeSalary.update(
								{
									baseSalary: updateData.baseSalary,
									monthlySalary: updateData.monthlySalary,
									dailyCost: updateData.dailyCost,
									startDate: updateData.startDate,
									endDate: updateData.endDate,
								},
								{ where: { id: updateData.id }, transaction },
							);
							updatedIds.push(updateData.id);
						}
					}
					count += 1;
				}
			}
			await EmployeeSalary.destroy({
				where: {
					id: {
						[Op.in]: removalbleIds,
					},
				},
				transaction,
			});

			await EmployeeSalary.update(
				{
					endDate: null,
				},
				{ where: { id: { [Op.in]: [546, 1933, 2146, 2136] } }, transaction },
			);
			console.log({ totalEmployeesCount: count });
			console.log({ removalbleIds: JSON.stringify(removalbleIds), length: removalbleIds?.length });
			console.log({ updatedIds: JSON.stringify(updatedIds), length: updatedIds?.length });
			await transaction.commit();
		} catch (error) {
			console.log({ error });
			await transaction.rollback();
		}
	} catch (error) {
		console.log({ error });
	}
	console.log('info', '-------------------------End Employee Salary Remove Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
