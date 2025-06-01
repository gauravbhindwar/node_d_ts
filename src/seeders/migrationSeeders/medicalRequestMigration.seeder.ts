import LoginUser from '@/models/loginUser.model';
import MedicalRequest from '@/models/medicalRequest.model';
import MedicalType from '@/models/medicalType.model';
import User from '@/models/user.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IMedicalRequestData {
	Id: string;
	EmployeeId: string;
	MedicalDate: string;
	MedicalTypeID: string;
	StatusId: string;
	FormNo: string;
	CreatedDate: string;
	UserName: string;
	UpdatedDate: string | null;
	UpdatedUserName: string | null;
	Name: string;
}

(async function injectMedicalRequest() {
	const result = await mssqldb.query(
		'SELECT rd_EmployeeMedical.*,rd_MedicalType.Name FROM rd_EmployeeMedical INNER JOIN rd_MedicalType ON rd_MedicalType.Id=rd_EmployeeMedical.MedicalTypeID',
	);
	console.log('info', '------------------------- Start Medical Request Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IMedicalRequestData[]) {
			try {
				const isEmployee = await employeeRepo.get({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });
				const medicalTypeData = await MedicalType.findOne({ where: { name: data.Name } });
				const reference = `LRED/MC/${moment(data.CreatedDate).format('DDMMMYY')}/${String(data.FormNo).padStart(
					4,
					'0',
				)}`.toUpperCase();

				if (isEmployee && medicalTypeData) {
					const medicalExpiry = moment(moment(data.MedicalDate).format('DD/MM/YYYY'), 'DD/MM/YYYY')
						.add(medicalTypeData.daysExpiry || 0, 'days')
						.toDate();
					const medicalRequestData = {
						employeeId: isEmployee.id,
						medicalTypeId: medicalTypeData.id,
						medicalDate: data.MedicalDate ? moment(data.MedicalDate).toDate() : null,
						medicalExpiry: medicalExpiry,
						reference: reference,
						createdBy: null,
						createdAt: data.CreatedDate ? moment(data.CreatedDate).toDate() : null,
						updatedBy: null,
						updatedAt: data.UpdatedDate ? moment(data.UpdatedDate).toDate() : null,
					};
					if (data.UserName) {
						const userData = await User.findOne({
							where: { deletedAt: null },
							include: [{ model: LoginUser, where: { email: data.UserName } }],
						});
						medicalRequestData.createdBy = userData?.id || null;
					}
					if (data.UpdatedUserName) {
						const updatedUserData = await User.findOne({
							where: { deletedAt: null },
							include: [{ model: LoginUser, where: { email: data.UpdatedUserName } }],
						});
						medicalRequestData.updatedBy = updatedUserData?.id || null;
					}
					const resultData = await MedicalRequest.create(medicalRequestData);

					// if (resultData) {
					// 	await employeeRepo.update(
					// 		{
					// 			medicalCheckDate: medicalRequestData.medicalDate,
					// 			medicalCheckExpiry: medicalExpiry,
					// 		},
					// 		{ where: { id: isEmployee.id } },
					// 	);
					// }
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Medical Request Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
