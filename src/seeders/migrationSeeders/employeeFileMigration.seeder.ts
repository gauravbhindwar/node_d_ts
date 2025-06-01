import EmployeeFile from '@/models/employeeFile.model';
import LoginUser from '@/models/loginUser.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import FolderRepo from '@/repository/folder.repository';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';

const userRepo = new UserRepo();
const employeeRepo = new EmployeeRepo();
const folderRepo = new FolderRepo();

(async function injectMessage() {
	console.info('info', '------------------------- Start Employee File Migration -------------------------');

	const result = await mssqldb.query(
		'SELECT rd_EmployeeFile.*,rd_Folder.Name as FolderName FROM rd_EmployeeFile LEFT JOIN rd_Folder on rd_EmployeeFile.FolderId=rd_Folder.Id',
	);
	const userArr = new Map();
	const empArr = new Map();
	const folderArr = new Map();

	if (result.length) {
		for (const data of result[0] as any) {
			if (data.DeletedUserName && !userArr.get(data.DeletedUserName)) {
				const userData = await userRepo
					.get({
						include: [{ model: LoginUser, required: true, where: { email: data.DeletedUserName } }],
					})
					.then((parserData) => parse(parserData));
				userArr.set(data.UserName, userData);
			}

			if (data.EmployeeId && !empArr.get(data.EmployeeId)) {
				const empData = await employeeRepo
					.get({ attributes: ['id', 'clientId', 'startDate'], where: { oldEmployeeId: data.EmployeeId } })
					.then((parserData) => parse(parserData));
				empArr.set(data.EmployeeId, empData);
			}

			if (data.FolderName && !folderArr.get(data.FolderName)) {
				const folderData = await folderRepo
					.get({ where: { name: data.FolderName } })
					.then((parserData) => parse(parserData));
				folderArr.set(data.FolderName, folderData);
			}
			await EmployeeFile.create({
				employeeId: data?.EmployeeId ? empArr.get(data?.EmployeeId)?.id : null,
				fileLink: false,
				name: data.Name ?? null,
				fileName: `/employeeRelatedFiles/${data.FileName}`,
				folderId: data?.FolderName ? folderArr.get(data?.FolderName)?.id : null,
				status: data.StatusId,
				fileSize: null,
				deletedAt: data.DeletedAt ? data.DeletedAt : null,
				updatedBy: data?.DeletedUserName ? userArr.get(data?.DeletedUserName)?.id : null,
				updatedAt: data.DeletedAt ? data.DeletedAt : null,
				createdAt: data.UploadDate ? data.UploadDate : new Date(),
				createdBy: data.UserName ? userArr.get(data.DeletedUserName)?.id : null,
			});
		}
	}
	console.info('info', '-------------------------End Employee File Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
