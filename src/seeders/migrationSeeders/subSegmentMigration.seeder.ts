import Client from '@/models/client.model';
import SubSegment from '@/models/subSegment.model';
import mssqldb from '@/mssqldb';
import SegmentRepo from '@/repository/segment.repository';
import slugify from 'slugify';

const segmentRepo = new SegmentRepo();

interface ISubSegmentData {
	Id: string;
	SegmentId: string;
	Code: string | null;
	Name: string;
	ShowDailyCosts: boolean;
	FridayBonus: number | null;
	SaturdayBonus: number | null;
	OvertimeABonus: number | null;
	OvertimeBBonus: number | null;
	CostCentre: string | null;
	SegmentName: string | null;
	SegmentCode: string | null;
	ClientId: string | null;
}

(async function injectSubSegment() {
	// Start Sub Segment Migration *********************************
	const result = await mssqldb.query(
		'SELECT rd_SubSegment.*,rd_Segment.Name as SegmentName,rd_Segment.Code as SegmentCode,rd_Segment.ClientId FROM rd_SubSegment INNER JOIN rd_Segment ON rd_Segment.Id=rd_SubSegment.SegmentId',
	);
	console.log('info', '--------------------Start Sub Segment Migration--------------------');
	if (result.length) {
		for (const data of result[0] as ISubSegmentData[]) {
			const segmentData = await segmentRepo.get({
				where: { name: data.SegmentName, code: data.SegmentCode },
				include: [{ model: Client, where: { oldClientId: data.ClientId } }],
			});
			if (segmentData) {
				const uniqueSlug = data.Name + data.Code;
				const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });
				const subSegmentData = {
					code: data.Code || ' ',
					name: data.Name,
					segmentId: segmentData.id,
					costCentre: data.CostCentre || null,
					fridayBonus: data.FridayBonus || null,
					saturdayBonus: data.SaturdayBonus || null,
					overtime01Bonus: data.OvertimeABonus || null,
					overtime02Bonus: data.OvertimeBBonus || null,
					slug: slug,
				};
				const isExistSegment = await SubSegment.findOne({
					where: {
						name: subSegmentData.name,
						code: subSegmentData.code,
						segmentId: segmentData.id,
						deletedAt: null,
					},
				});
				if (!isExistSegment) await SubSegment.create(subSegmentData);
				else await SubSegment.update(subSegmentData, { where: { id: isExistSegment.id } });
			}
		}
	}
	console.log('info', '--------------------End Sub Segment Migration--------------------');
	// End Sub Segment Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
