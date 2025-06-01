import Contact from '@/models/contact.model';
import mssqldb from '@/mssqldb';
import ClientRepo from '@/repository/client.repository';
import { createRandomHash } from '@/utils/common.util';
import slugify from 'slugify';
const clientRepo = new ClientRepo();

interface IContactData {
	Id: number;
	ClientId: number;
	Name: string;
	Email: string | null;
	AddressLine1: string | null;
	AddressLine2: string | null;
	AddressLine3: string | null;
	AddressLine4: string | null;
	City: string | null;
	Region: string | null;
	PostalCode: string | null;
	CountryId: number | null;
	DueDateDays: number | null;
	BrandingTheme: string | null;
	ClientName: string | null;
	CountryName: string | null;
}

(async function injectContact() {
	const result = await mssqldb.query(
		'SELECT rd_Contact.*,rd_Client.Name as ClientName,rd_Country.NiceName as CountryName FROM rd_Contact INNER JOIN rd_Client ON rd_Client.Id = rd_Contact.ClientId LEFT JOIN rd_Country on rd_Country.Id =rd_Contact.CountryId',
	);
	console.log('info', '------------------------- Start Contact Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IContactData[]) {
			try {
				const slugifyContact = data.Name + createRandomHash(5);
				const slug = slugify(slugifyContact, { lower: true, replacement: '-' });
				// was yopmail and for changed to lredTest
				const email = data.Email ? data.Email : data.Name?.replace(/\s/g, '') + '@lredtest.com';
				const clientData = await clientRepo.get({
					where: { oldClientId: data.ClientId, deletedAt: null },
				});
				if (clientData) {
					const isExistContact = await Contact.findOne({ where: { email: email, deletedAt: null } });
					const contactData = {
						name: data.Name,
						email: email,
						address1: data.AddressLine1 || '',
						slug: slug,
						address2: data.AddressLine2 || null,
						address3: data.AddressLine3 || null,
						address4: data.AddressLine4 || null,
						city: data.City || ' ',
						region: data.Region || ' ',
						postalCode: data.PostalCode || ' ',
						country: data.CountryName || ' ',
						dueDateDays: data.DueDateDays || 0,
						brandingTheme: data.BrandingTheme || null,
						clientId: clientData?.id ?? 0,
					};
					if (!isExistContact) await Contact.create(contactData);
					else await Contact.update(contactData, { where: { id: isExistContact.id } });
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Contact Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
