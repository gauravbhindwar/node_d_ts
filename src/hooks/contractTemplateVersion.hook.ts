import ContractTemplateVersion from '@/models/contractTempleteVersion.model';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';

export const contractTemplateVersionHook = async (contractTemplateVersion: ContractTemplateVersion) => {
	const existData = await ContractTemplateVersion.findOne({
		where: {
			id: {
				[Op.not]: contractTemplateVersion.id,
			},
			contractTemplateId: contractTemplateVersion.contractTemplateId,
		},
		limit: 1,
		order: [['id', 'DESC']],
	});
	const data = parse(existData);
	const dataExistValue = await ContractTemplateVersion.findAll({
		where: {
			contractTemplateId: {
				[Op.gt]: contractTemplateVersion.contractTemplateId,
			},
			deletedAt: null,
		},
		attributes: ['id', 'versionNo', 'contractTemplateId', 'description', 'isActive'],
		order: [['id', 'ASC']],
	});

	if (data === null) {
		return await contractTemplateVersion.update({ versionNo: 1 }, { where: { id: contractTemplateVersion.id } });
	} else if (data && dataExistValue && data.versionNo >= 1 && data.contractTemplateId) {
		return await contractTemplateVersion.update(
			{ versionNo: data.versionNo + 1 },
			{ where: { id: contractTemplateVersion.id } },
		);
	} else {
		return await contractTemplateVersion.update(
			{ versionNo: contractTemplateVersion.id },
			{ where: { id: contractTemplateVersion.id } },
		);
	}
};
