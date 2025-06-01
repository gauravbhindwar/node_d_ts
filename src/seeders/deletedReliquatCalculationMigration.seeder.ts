import db from '@/models';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

(async function deleteReliquatData(): Promise<void> {
	const reliquatCalcRepo = new ReliquatCalculationRepo();
	const currentDate = moment(moment(new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY');
	const lastDayOfMonth = currentDate.clone().endOf('month');
	try {
		await db.transaction(async (transaction) => {
			const isExist = await reliquatCalcRepo
				.getAll({
					where: {
						startDate: {
							[Op.gt]: lastDayOfMonth.toDate(),
						},
					},
					transaction,
				})
				.then((dat) => parse(dat));

			if (isExist && isExist.length > 0) {
				for (const iterator of isExist) {
					try {
						await reliquatCalcRepo.deleteData({
							where: {
								id: iterator.id,
							},
							force: true,
							transaction,
						});
					} catch (error) {
						console.error('Error occurred during deletion:', error);
					}
				}
			}
		});

		console.log('info', 'Employee Reliquat Data Deleted Successfully.....');
	} catch (err) {
		console.error('error', err.message);
	}
})();
