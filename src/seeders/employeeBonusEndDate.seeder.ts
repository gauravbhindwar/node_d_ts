import db from '@/models';
import EmployeeBonus from '@/models/employeeBonus.model';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function injectEmployeeBonusEndDate() {
	try {
		const employeeRepo = new EmployeeRepo();
		console.log('info', '-------------------------Start Employee Bonus End Date Migration-------------------------');
		let employeeData = await employeeRepo.getAll({
			attributes: ['id', 'customBonus', 'terminationDate'],
			paranoid: false,
			order: [['id', 'asc']],
			where: {
				terminationDate: {
					[Op.ne]: null,
				},
			},
			include: [
				{
					model: EmployeeBonus,
					attributes: ['id', 'employeeId', 'startDate', 'endDate'],
					required: true,
					where: {
						endDate: null,
					},
				},
			],
		});
		employeeData = parse(employeeData);
		const transaction = await db.transaction();
		try {
			const employeeIds = employeeData?.map((e) => e.id);
			let bonusHistoryIds = [];
			for (const data of employeeData) {
				const bonusData = await EmployeeBonus.findAll({
					where: { employeeId: data?.id, endDate: null },
					attributes: ['id', 'endDate'],
					transaction,
				});
				const bonusIds = bonusData.map((e) => e.id);
				bonusHistoryIds = [...bonusHistoryIds, ...bonusIds];
				await EmployeeBonus.update(
					{
						endDate: moment(moment(data?.terminationDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').toDate(),
					},
					{ where: { employeeId: data?.id, endDate: null }, transaction },
				);
			}

			await transaction.commit();
			console.log({ totalEmployees: employeeData?.length });
			console.log({ employeeIds: JSON.stringify(employeeIds) });
			console.log({ bonusHistoryIds: JSON.stringify(bonusHistoryIds) });
		} catch (error) {
			console.log({ error });
			await transaction.rollback();
		}
	} catch (error) {
		console.log({ error });
	}
	console.log('info', '-------------------------End Employee Bonus End Date Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
