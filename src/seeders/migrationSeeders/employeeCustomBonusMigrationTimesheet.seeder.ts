import BonusType from '@/models/bonusType.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
const employeeRepo = new EmployeeRepo();

(async function injectEmployeeCustomBonus() {
	const result = await mssqldb.query(
		'SELECT rd_BonusType.Code as BonusCode, rd_BonusType.Id as BonusId,rd_BonusType.Value as Value, rd_BonusType.DailyCost as DailyCost, rd_TimesheetBonus.EmployeeId  as employeeId FROM rd_TimesheetBonus INNER JOIN rd_BonusType ON rd_BonusType.Id = rd_TimesheetBonus.BonusTypeId',
	);
	console.log('info', '------------------------- Start Employee Custom Bonus Migration -------------------------');
	if (result.length) {
		const employeesArr = new Map();
		const bonusArr = new Map();
		let updatedCount = 0;
		let notUpdatedCount = 0;
		const errors = [];

		for (const data of result[0] as any[]) {
			try {
				if (!(await employeesArr.get(data.employeeId))) {
					const empData = await employeeRepo
						.get({ attributes: ['id', 'customBonus'], where: { oldEmployeeId: data.employeeId } })
						.then((parserData) => parse(parserData));
					employeesArr.set(data.employeeId, empData);
				}
				if (!(await bonusArr.get(data.BonusId))) {
					const bonusData = await BonusType.findOne({ where: { code: data.BonusCode.trim() } }).then((parserData) =>
						parse(parserData),
					);
					bonusArr.set(data.BonusId, bonusData);
				}
				const employeeId: { id: number; customBonus: string } = await employeesArr.get(data.employeeId);
				let customBonus = employeeId?.customBonus ? JSON.parse(employeeId.customBonus)?.data : [];
				const customBonusData = {
					id: await bonusArr.get(data.BonusId).id,
					label: data.BonusCode,
					price: data.Value || 0.0,
					coutJournalier: data.DailyCost || 0.0,
				};
				if (customBonus) {
					if (customBonus.findIndex((dat) => dat.label == data.BonusCode) == -1) {
						customBonus.push(customBonusData);
					}
				} else {
					customBonus = [customBonusData];
				}
				if (customBonus.length != employeeId?.customBonus ? JSON.parse(employeeId.customBonus)?.data?.length : 0) {
					await employeeRepo.update(
						{ customBonus: JSON.stringify({ data: customBonus }) },
						{ where: { id: employeeId.id } },
					);
					employeesArr.set(data.employeeId, { ...employeeId, customBonus: JSON.stringify({ data: customBonus }) });
					updatedCount++;
				} else {
					notUpdatedCount++;
					console.log('bonus not updated');
				}
			} catch (error) {
				console.log('ERROR', error);
				errors.push(error);
			}
		}
		console.log({ recordsUpdated: updatedCount, recordsNotUpdated: notUpdatedCount }, '\nerror : ', errors);
	}
	console.log('info', '-------------------------End Employee Custom Bonus Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
