import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import { parse } from '@/utils/common.util';
import moment from 'moment';

//==============Add Slug on Database Tables(Client, Employee, Segment, Sub-Segment, Employee)=============
(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Employee Table
		const targetTime = '00:00:00';
		const findEmployee = await Employee.findAll({
			where: {
				deletedAt: null,
			},
			include: [
				{
					model: EmployeeContract,
				},
			],
			attributes: ['id', 'contractEndDate'],
			transaction,
		}).then((data) => parse(data));

		if (findEmployee && findEmployee?.length > 0) {
			for (const iterator of findEmployee) {
				const contractEndTime = moment(iterator.contractEndDate).format('HH:mm:ss');
				if (contractEndTime !== targetTime) {
					console.log({ empId: iterator.id });
					await Employee.update(
						{
							contractEndDate: iterator.contractEndDate
								? moment(moment(iterator.contractEndDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate()
								: null,
						},
						{ where: { id: iterator.id } },
					);
				}
				if (iterator?.employeeContracts && iterator?.employeeContracts?.length > 0) {
					for (const obj of iterator.employeeContracts) {
						if (obj.startDate !== targetTime && obj.endDate !== targetTime) {
							await EmployeeContract.update(
								{
									startDate: obj.startDate
										? moment(moment(obj.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate()
										: null,
									endDate: obj.endDate ? moment(moment(obj.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() : null,
								},
								{ where: { employeeId: obj.employeeId } },
							);
						}
					}
				}
			}
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Contract End Date Updated Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
