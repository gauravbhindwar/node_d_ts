import LoginUser from '@/models/loginUser.model';
import EmployeeRepo from '@/repository/employee.repository';
import { parse } from '@/utils/common.util';
import fs from 'fs';
import path from 'path';

const employeeRepo = new EmployeeRepo();

(async function injectEmployeeProfileImage() {
	console.info('info', '------------------------- Start Employee Profile Migration -------------------------');

	const profileImagePath = path.join(__dirname, '../../../public/profilePicture');
	const fileNamesWithoutExtension = fs.readdirSync(profileImagePath).map((file) => path.parse(file).name.toUpperCase());
	const userArr = [];
	for (const iterator of fileNamesWithoutExtension) {
		if (iterator && !userArr?.includes(iterator)) {
			const data = await employeeRepo
				.get({
					where: {
						oldEmployeeId: iterator,
					},
					include: [
						{
							model: LoginUser,
						},
					],
				})
				.then((parserData) => parse(parserData));
			userArr.push(iterator);
			if (data?.loginUserId) {
				await LoginUser.update(
					{
						profileImage: iterator.toLowerCase() + '.jpg',
					},
					{ where: { id: data?.loginUserId } },
				);
			}
		}
	}

	console.info('info', '------------------------- End Employee Profile Migration -------------------------');
})().catch((err) => {
	console.error('Error:', err.message);
});
