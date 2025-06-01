import EmployeeSegment from '@/models/employeeSegment.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

const reliquatCalculationRepo = new ReliquatCalculationRepo();
// const reliquatCalculationV2Repo = new ReliquatCalculationV2Repo();

(async function injectReliquatCalculation() {
	let result = await Timesheet.findAll({
		where: {
			deletedAt: null,
		},
		order: [['startDate', 'asc']],
	});
	result = parse(result);
	console.log('info', '------------------------- Start Reliquat Calculation Migration -------------------------');
	if (result.length) {
		for (const data of result) {
			try {
				let employeeSegent = await EmployeeSegment.findOne({
					where: {
						employeeId: data.employeeId,
						date: {
							[Op.lte]: moment(data.endDate).toDate(),
						},
					},
					include: [
						{ model: Segment, attributes: ['id'] },
						{ model: SubSegment, attributes: ['id'] },
					],
					order: [['date', 'desc']],
				});
				employeeSegent = parse(employeeSegent);
				if (
					employeeSegent?.segmentId &&
					employeeSegent?.segmentId == data?.segmentId &&
					employeeSegent?.subSegmentId == data?.subSegmentId
				) {
					await reliquatCalculationRepo.addReliquatCalculationService(
						{
							employeeId: String(data.employeeId),
							timesheetId: data.id,
							userId: null,
						},
						null,
					);
					// await reliquatCalculationV2Repo.generateReliquatCalculationV2([data.employeeId], data.id, null);
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Reliquat Calculation Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
