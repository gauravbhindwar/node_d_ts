import Contact from '@/models/contact.model';
import Segment from '@/models/segment.model';
import mssqldb from '@/mssqldb';
import ClientRepo from '@/repository/client.repository';
import slugify from 'slugify';

const clientRepo = new ClientRepo();

interface ISegmentData {
	Id: string;
	ClientId: string;
	Code: string | null;
	Name: string;
	ShowDailyCosts: boolean | null;
	ContactId: string | null;
	VATRate: number | null;
	XeroFormat: number | null;
	FridayBonus: number | null;
	SaturdayBonus: number | null;
	OvertimeABonus: number | null;
	OvertimeBBonus: number | null;
	CostCentre: string | null;
	ContactName: string | null;
}

(async function injectSegment() {
	// Start Segment Migration *********************************
	const result = await mssqldb.query(
		'SELECT rd_Segment.*,rd_Client.Name as ClientName,rd_Contact.Name as ContactName FROM rd_Segment INNER JOIN rd_Client ON rd_Client.Id=rd_Segment.ClientId LEFT JOIN rd_Contact ON rd_Contact.Id=rd_Segment.ContactId',
	);
	console.log('info', '------------------------- Start Segment Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as ISegmentData[]) {
			const clientData = await clientRepo.get({
				where: { oldClientId: data.ClientId, deletedAt: null },
			});
			if (clientData) {
				const uniqueSlug = data.Name + data.Code;
				const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });
				const segmentData = {
					code: data.Code || ' ',
					name: data.Name,
					contactId: null,
					clientId: clientData.id,
					costCentre: data.CostCentre || null,
					fridayBonus: data.FridayBonus || null,
					saturdayBonus: data.SaturdayBonus || null,
					overtime01Bonus: data.OvertimeABonus || null,
					overtime02Bonus: data.OvertimeBBonus || null,
					vatRate: data.VATRate || null,
					xeroFormat: data.XeroFormat || null,
					slug: slug,
				};
				if (data.ContactName) {
					// was yopmail and for changed to lredTest
					const contactEmail = data.ContactName?.replace(/\s/g, '') + '@lredtest.com';
					const isContact = await Contact.findOne({ where: { email: contactEmail, deletedAt: null } });
					segmentData.contactId = isContact?.id;
				}

				const isExistSegment = await Segment.findOne({
					where: { clientId: clientData.id, name: data.Name, code: data.Code, deletedAt: null },
				});
				if (!isExistSegment) await Segment.create(segmentData);
				else await Segment.update(segmentData, { where: { id: isExistSegment.id } });
			}
		}
	}
	console.log('info', '--------------------End Segment Migration--------------------');
	// End Segment Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
