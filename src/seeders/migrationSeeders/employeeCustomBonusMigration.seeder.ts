import BonusType from '@/models/bonusType.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
const employeeRepo = new EmployeeRepo();

interface IEmployeeCustomBonus {
	EmployeeId: string;
	BonusTypeId: string;
	Value: number | null;
	DailyCost: number | null;
	EffectiveDate: Date | string | null;
	BonusCode: string;
}

(async function injectEmployeeCustomBonus() {
	const result = await mssqldb.query(
		'SELECT rd_EmployeeBonusType.*,rd_BonusType.Code as BonusCode FROM rd_EmployeeBonusType INNER JOIN rd_BonusType ON rd_BonusType.Id=rd_EmployeeBonusType.BonusTypeId',
	);
	console.log('info', '------------------------- Start Employee Custom Bonus Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IEmployeeCustomBonus[]) {
			try {
				const employeeId = await employeeRepo.get({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });
				const bonusData = await BonusType.findOne({ where: { code: data.BonusCode.trim() } });
				if (bonusData && employeeId) {
					let customBonus = employeeId?.customBonus && JSON.parse(employeeId.customBonus)?.data;
					const customBonusData = {
						id: bonusData.id,
						label: data.BonusCode,
						price: data.Value || 0.0,
						coutJournalier: data.DailyCost || 0.0,
					};
					if (customBonus) {
						customBonus.push(customBonusData);
					} else {
						customBonus = [customBonusData];
					}
					await employeeRepo.update(
						{ customBonus: JSON.stringify({ data: customBonus }) },
						{ where: { id: employeeId.id } },
					);
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Employee Custom Bonus Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
