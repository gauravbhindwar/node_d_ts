import db from '@/models';
import MedicalType from '@/models/medicalType.model';
import RequestType from '@/models/requestType.model';

(async function injectMedicalRequestType(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Medical Type Table
		const medicalTypeData = [
			{
				index: 2,
				name: 'Visit d’Aptitute Periodique',
				format: 'Request days before expiry',
				daysBeforeExpiry: 10,
			},
			{
				index: 4,
				name: 'Consultation',
				format: 'Request days before expiry',
				daysBeforeExpiry: 10,
			},
			{
				index: 5,
				name: 'Test Rapide Covid-19',
				format: 'Available anytime',
				daysBeforeExpiry: null,
			},
			{
				index: 1,
				name: 'Visite d’Embauche',
				format: 'Request at start, once only',
				daysBeforeExpiry: null,
			},
			{
				index: 3,
				name: 'Reprise medical',
				format: 'Request days before expiry',
				daysBeforeExpiry: 10,
			},
			{
				index: 6,
				name: 'COVID PCR Test',
				format: 'Available anytime',
				daysBeforeExpiry: null,
			},
		];

		for (const medicalType of medicalTypeData) {
			const isExist = await MedicalType.findOne({
				where: {
					index: medicalType.index,
					name: medicalType?.name,
					deletedAt: null,
				},
				transaction,
			});
			if (!isExist) {
				await MedicalType.create(medicalType, { transaction });
			}
		}

		const requestTypeData = [
			{
				name: 'Contract / Avenant',
				notificationEmails:
					'Algeria.HR@lred.com,reception@lred.com,admin@lred.com,mounia@lred.com,tarik.boudjoghra@lred.com',
				isActive: true,
			},
			{
				name: 'Certificat de Travail',
				notificationEmails:
					'Algeria.HR@lred.com,reception@lred.com,admin@lred.com,mounia@lred.com,tarik.boudjoghra@lred.com',
				isActive: true,
			},
			{
				name: 'Relevé des Emoluments',
				notificationEmails: 'Ibtissem.Talabouzerouf@lred.com, admin@lred.com, mounia@lred.com',
				isActive: true,
			},
			{
				name: 'Attestation de Travail',
				notificationEmails:
					'Algeria.HR@lred.com,reception@lred.com,admin@lred.com,mounia@lred.com,tarik.boudjoghra@lred.com',
				isActive: true,
			},
			{
				name: 'ATS',
				notificationEmails: 'Ibtissem.Talabouzerouf@lred.com, tarik.boudjoghra@lred.com, admin@lred.com',
				isActive: true,
			},
			{
				name: 'Fiche de Pay (Payslips), needs to include the month',
				notificationEmails: 'Ibtissem.Talabouzerouf@lred.com,tarik.boudjoghra@lred.com, admin@lred.com',
				isActive: true,
			},
		];

		for (const requestType of requestTypeData) {
			const isExist = await RequestType.findOne({
				where: {
					name: requestType?.name,
					deletedAt: null,
				},
				transaction,
			});
			if (!isExist) {
				await RequestType.create(requestType, { transaction });
			}
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Medical Type and Request Type Data Added Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
