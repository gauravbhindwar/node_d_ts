import { IBonusTypeCreate } from '@/interfaces/model/bonusType.interface';
import mssqldb from '@/mssqldb';
import BonusTypeRepo from '@/repository/bonusType.repository';
import { parse } from '@/utils/common.util';

const bonusTypeRepo = new BonusTypeRepo();

interface IBonusTypeOld {
	Id: string;
	ClientId: string;
	Name: string;
	Value: number;
	DailyCost: number;
	Code: string;
	NamePrint: string;
	Active: boolean;
}

(async function injectBonus() {
	const result = await mssqldb.query('SELECT * FROM rd_BonusType');
	console.info('info', '------------------------- Start Bonus Migration -------------------------');

	if (result.length) {
		for (const data of result[0] as IBonusTypeOld[]) {
			try {
				const newBonus: IBonusTypeCreate = {
					code: data.Code.trim(),
					name: data.Name,
					timesheetName: data.NamePrint,
					isActive: data.Active,
					basePrice: 0,
					dailyCost: 0,
				};
				const resp = await bonusTypeRepo.getAll({ where: { code: data.Code.trim() } }).then((parser) => {
					return parse(parser);
				});
				if (resp?.length == 0) {
					await bonusTypeRepo.create({ ...newBonus });
				}
			} catch (error) {
				console.error('ERROR', error);
			}
		}
	}
	console.info('info', '-------------------------End Bonus Migration-------------------------');
	// End Bonus Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
