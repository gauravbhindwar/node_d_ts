import db from '@/models';
import Employee from '@/models/employee.model';
import { parse } from '@/utils/common.util';

interface ICustomBonus {
	id: number;
	label: string;
	price: number;
	coutJournalier: number;
}

(async function injectEmployeeBonusCatalogue() {
	try {
		let employeeData = await Employee.findAll({
			attributes: ['id', 'customBonus'],
			paranoid: false,
			order: [['id', 'asc']],
		});
		employeeData = parse(employeeData);
		console.log({ length: employeeData?.length });

		for (const data of employeeData) {
			const transaction = await db.transaction();
			try {
				const customBonus = JSON.parse(data?.customBonus);
				if (customBonus && customBonus?.data?.length > 0) {
					const catalogueNumber = null;
					const customBonusArr = [];
					customBonus.data.forEach((element: ICustomBonus) => {
						customBonusArr.push({ ...element, catalogueNumber });
					});
					const updatedCustomBonus = JSON.stringify({ data: customBonusArr });
					await Employee.update({ customBonus: updatedCustomBonus }, { where: { id: data.id }, transaction });
				}
				await transaction.commit();
			} catch (error) {
				console.log({ error });
				await transaction.rollback();
			}
		}
	} catch (error) {
		console.log({ error });
	}
	console.log('info', '-------------------------End Employee Bonus Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
