import { employeeLeaveStatus } from '@/interfaces/model/employeeLeave.interface';
import EmployeeLeave from '@/models/employeeLeave.model';
import LoginUser from '@/models/loginUser.model';
import User from '@/models/user.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IEmployeeLeaveData {
	Id: string;
	EmployeeId: string;
	StartDate: Date;
	EndDate: Date;
	CreatedDate: Date;
	UserName: string;
	FormNo: number | null;
	StatusId: number;
	UpdatedDate: Date | null;
	UpdatedUserName: string | null;
	Reference: string | null;
	Balance: number | null;
}

(async function injectEmployeeLeave() {
	const result = await mssqldb.query('SELECT * FROM rd_EmployeeHoliday');
	console.log('info', '------------------------- Start Employee Leave(Holiday) Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IEmployeeLeaveData[]) {
			try {
				const isEmployee = await employeeRepo.get({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });
				const totalDays = moment(new Date(data.EndDate)).diff(new Date(data.StartDate), 'days');
				if (isEmployee) {
					const employeeLeaveData = {
						employeeId: isEmployee.id,
						leaveType: 'AP',
						startDate: moment(data.StartDate).toDate(),
						endDate: moment(data.EndDate).toDate(),
						status: data.StatusId == 1 ? employeeLeaveStatus.ACTIVE : employeeLeaveStatus.CANCELLED,
						createdAt: moment(data.CreatedDate).toDate(),
						updatedAt: data.UpdatedDate ? moment(data.UpdatedDate).toDate() : null,
						reference: data.Reference,
						segmentId: isEmployee?.segmentId,
						rotationId: isEmployee?.rotationId,
						employeeContractEndDate: isEmployee?.contractEndDate,
						totalDays: totalDays,
						createdBy: null,
						updatedBy: null,
					};
					const userData = data.UserName
						? await User.findOne({
								where: { deletedAt: null },
								include: [{ model: LoginUser, where: { email: data.UserName } }],
						  })
						: null;
					if (userData) {
						employeeLeaveData.createdBy = userData.id;
					}
					if (data.UpdatedUserName) {
						const updatedUserData = await User.findOne({
							where: { deletedAt: null },
							include: [{ model: LoginUser, where: { email: data.UpdatedUserName } }],
						});
						employeeLeaveData.updatedBy = updatedUserData?.id;
					}
					await EmployeeLeave.create(employeeLeaveData);
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Employee Leave(Holiday) Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
