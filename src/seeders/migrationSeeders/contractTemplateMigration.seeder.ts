import ContractTemplate from '@/models/contractTemplete.model';
import ContractTemplateVersion from '@/models/contractTempleteVersion.model';
import LoginUser from '@/models/loginUser.model';
import User from '@/models/user.model';
import ClientRepo from '@/repository/client.repository';
import moment from 'moment';

import mssqldb from '@/mssqldb';

const clientRepo = new ClientRepo();

interface IContractTemplateData {
	Id: number;
	ClientId: number;
	Name: string;
	Email: string | null;
	Active: boolean;
	CreatedDate: Date | null;
	CreatedUserName: string | null;
}

interface IContractTemplateVersionData {
	Id: string;
	ContractTemplateId: string;
	VersionNo: any;
	Text: string | null;
	StatusId: boolean;
	CreatedDate: Date | null;
	CreatedUserName: string | null;
	ApprovedDate: Date | null;
	ApprovedUserName: string | null;
}

(async function injectContractTemplate() {
	// Start Contract Template Migration *********************************
	const result = await mssqldb.query(
		'SELECT ContractTemplate.*,AspNetUsers.Email FROM ContractTemplate INNER JOIN AspNetUsers ON ContractTemplate.CreatedUserName=AspNetUsers.UserName',
	);
	console.log('info', '------------------------- Start Contract Template Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IContractTemplateData[]) {
			try {
				const clientData = await clientRepo.get({ where: { oldClientId: data.ClientId, deletedAt: null } });
				if (clientData) {
					const contractTemplateData = {
						contractName: data.Name,
						clientId: clientData.id,
						isActive: data.Active,
						createdAt: new Date(),
						createdBy: null,
					};
					if (data.CreatedUserName) {
						const userData = await User.findOne({
							where: { deletedAt: null },
							include: [{ model: LoginUser, where: { email: data.CreatedUserName } }],
						});
						if (userData) {
							contractTemplateData.createdAt = moment(data.CreatedDate).toDate();
							contractTemplateData.createdBy = userData.id;
						}
					}
					let contractTemplateId = null;
					const isExistContractTemplate = await ContractTemplate.findOne({
						where: { contractName: data.Name, clientId: clientData.id, deletedAt: null },
					});
					if (!isExistContractTemplate) {
						const contractTemplate = await ContractTemplate.create(contractTemplateData);
						contractTemplateId = contractTemplate.id;
					} else {
						contractTemplateId = isExistContractTemplate.id;
					}
					if (contractTemplateId) {
						// Start Contract Template Version Migration *********************************
						const resultData = await mssqldb.query(
							`SELECT ContractTemplateVersion.*,ContractTemplate.Name,ContractTemplate.ClientId FROM ContractTemplateVersion INNER JOIN ContractTemplate ON ContractTemplate.Id=ContractTemplateVersion.ContractTemplateId WHERE ContractTemplateVersion.ContractTemplateId='${data.Id}'`,
						);
						console.log('info', '--------------------Start Contract Template Version Migration--------------------');
						if (resultData.length) {
							for (const dataContractTemplate of resultData[0] as IContractTemplateVersionData[]) {
								try {
									const contractTemplateVersionData = {
										versionName: dataContractTemplate.VersionNo,
										description: dataContractTemplate.Text,
										contractTemplateId: contractTemplateId,
										versionNo: dataContractTemplate.VersionNo,
										isActive: dataContractTemplate.StatusId,
										createdAt: new Date(),
										createdBy: null,
										updatedAt: null,
										updatedBy: null,
									};
									if (dataContractTemplate.CreatedUserName) {
										const userData = await User.findOne({
											where: { deletedAt: null },
											include: [{ model: LoginUser, where: { email: dataContractTemplate.CreatedUserName } }],
										});
										if (userData) {
											contractTemplateVersionData.createdAt = moment(dataContractTemplate.CreatedDate).toDate();
											contractTemplateVersionData.createdBy = userData.id;
										}
									}
									if (dataContractTemplate.ApprovedUserName) {
										const userData = await User.findOne({
											where: { deletedAt: null },
											include: [{ model: LoginUser, where: { email: dataContractTemplate.ApprovedUserName } }],
										});
										if (userData) {
											contractTemplateVersionData.updatedAt = moment(dataContractTemplate.ApprovedDate).toDate();
											contractTemplateVersionData.updatedBy = userData.id;
										}
									}
									const isExistContractTemplateVersion = await ContractTemplateVersion.findOne({
										where: {
											description: dataContractTemplate.Text,
											isActive: dataContractTemplate.StatusId ? true : false,
											versionNo: dataContractTemplate.VersionNo,
											versionName: dataContractTemplate.VersionNo.toString(),
											contractTemplateId: contractTemplateId,
										},
									});

									if (!isExistContractTemplateVersion) {
										await ContractTemplateVersion.create(contractTemplateVersionData);
									}
								} catch (error) {
									console.log('ERROR', error);
								}
							}
						}
						console.log('info', '--------------------End Contract Template Version Migration--------------------');
						// End Contract Template Version Migration *********************************
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '--------------------End Contract Template Migration--------------------');
	// End Contract Template Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
