import Client from '@/models/client.model';
import ContractTemplate from '@/models/contractTemplete.model';
import ContractTemplateVersion from '@/models/contractTempleteVersion.model';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import LoginUser from '@/models/loginUser.model';
import User from '@/models/user.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IEmployeeContract {
	Id: string;
	EmployeeId: string;
	ContractTemplateVersionId: string;
	ContractNumber: string | null;
	FirstName: string;
	LastName: string;
	Address: string | null;
	Function: string | null;
	MonthlySalary: number | null;
	BaseSalary: number | null;
	RotationWeeksOn: number | null;
	RotationWeeksOff: number | null;
	StartDate: Date;
	EndDate: Date;
	DOB: Date | null;
	PlaceOfBirth: string | null;
	CreatedDate: Date;
	CreatedUserName: string;
	Name: string;
	ContractTemplateClientId: string;
	Text: string;
}

(async function injectEmployeeContract() {
	const result = await mssqldb.query(
		'SELECT rd_EmployeeContract.*,ContractTemplate.Name,ContractTemplate.ClientId as ContractTemplateClientId,ContractTemplateVersion.Text FROM rd_EmployeeContract LEFT JOIN ContractTemplateVersion ON ContractTemplateVersion.Id=rd_EmployeeContract.ContractTemplateVersionId LEFT JOIN ContractTemplate ON ContractTemplate.Id=ContractTemplateVersion.ContractTemplateId',
	);
	console.log('info', '------------------------- Start Employee Contract Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IEmployeeContract[]) {
			try {
				const employeeId = await employeeRepo.get({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });

				const contractTemplateVersionId = await ContractTemplateVersion.findOne({
					where: { deletedAt: null },
					include: [
						{
							model: ContractTemplate,
							where: { contractName: data.Name, deletedAt: null },
							include: [{ model: Client, where: { oldClientId: data.ContractTemplateClientId, deletedAt: null } }],
						},
					],
				});

				if (employeeId && contractTemplateVersionId) {
					const isExistEmployeeContract = await EmployeeContract.findOne({
						where: {
							employeeId: employeeId?.id,
							contractVersionId: contractTemplateVersionId?.id,
							newContractNumber: data.ContractNumber,
							startDate: moment(data.StartDate).toDate(),
						},
					});
					if (!isExistEmployeeContract) {
						const employeeContractData = {
							employeeId: employeeId?.id,
							contractVersionId: contractTemplateVersionId?.id,
							contractTemplateId: contractTemplateVersionId?.contractTemplate?.id,
							newContractNumber: data.ContractNumber,
							description: null,
							startDate: moment(data.StartDate).toDate(),
							endDate: moment(data.EndDate).toDate(),
							createdBy: null,
						};
						const userData = await User.findOne({
							where: { deletedAt: null },
							include: [{ model: LoginUser, where: { email: data.CreatedUserName } }],
						});
						if (userData) {
							employeeContractData.createdBy = userData.id;
						}
						await EmployeeContract.create(employeeContractData);

						const employeeData = await Employee.findOne({
							where: {
								id: employeeId?.id,
							},
						});
						employeeData &&
							(await Employee.update({ contractNumber: data.ContractNumber }, { where: { id: employeeData.id } }));
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Employee Contract Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
