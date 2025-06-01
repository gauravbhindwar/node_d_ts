import { Op } from 'sequelize';
import db from '../models';
import ContractTemplate from '../models/contractTemplete.model';
import ContractTemplateVersion from '../models/contractTempleteVersion.model';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Contract Template Remove Data
		const contractTemplateRemoveData = [
			'LRED_Contrat_de_Travail_Call_Out',
			'LRED_Contrat_de_Travail_Rotation',
			'LRED_Contrat_de_Travail_Resident',
		];

		const isExist = await ContractTemplate.findAll({
			where: {
				contractName: {
					[Op.in]: contractTemplateRemoveData,
				},
			},
			transaction,
		});
		if (isExist) {
			const removableIds = isExist.map((data) => {
				return data?.id;
			});
			await ContractTemplateVersion.destroy({
				where: {
					contractTemplateId: {
						[Op.in]: removableIds,
					},
				},
			});
			await ContractTemplate.destroy({
				where: {
					id: {
						[Op.in]: removableIds,
					},
				},
			});
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Contract Template Details Removed Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
