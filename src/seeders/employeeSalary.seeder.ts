import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import { parse } from '@/utils/common.util';

//==============Added Data in Employee Salary Table=============
(async function injectUsers(): Promise<void> {
	return db.transaction(async () => {
		// For Employee Salary Table

		let employeeData = await Employee.findAll({
			where: {
				deletedAt: null,
			},
		});

		employeeData = parse(employeeData);

		for (const employees of employeeData) {
			const isExist = await EmployeeSalary.findOne({ where: { employeeId: employees.id } });
			if (!isExist)
				await EmployeeSalary.create({
					baseSalary: employees.baseSalary ? Number(employees.baseSalary.toFixed(2)) : 0.0,
					monthlySalary: employees.monthlySalary ? Number(employees.monthlySalary.toFixed(2)) : 0.0,
					dailyCost: employees.dailyCost ? Number(employees.dailyCost.toFixed(2)) : 0.0,
					startDate: employees.startDate,
					endDate: null,
					employeeId: employees.id,
					createdBy: employees.createdBy,
				});
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Salary Added Successfully...');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
