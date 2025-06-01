import db from '@/models';
import LoginUserRepo from '@/repository/loginUser.repository';
import { parse } from '@/utils/common.util';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		const loginUserRepo = new LoginUserRepo();
		const corruptedFileEmployeeData = [
			'f8804cb9-1fed-459e-b092-b944dfb16b94.jpg',
			'de53d8e4-b23e-4404-be28-4ad831d632aa.jpg',
			'd4ab7909-b045-43f8-8a15-f2e8a8ca3c4d.jpg',
			'cb6a54f7-90f8-46b5-a2c5-f0ddf2c45025.jpg',
			'72406a1f-0662-465e-ae07-de7518b3fdc0.jpg',
			'6036e92b-9a8d-43c9-9db0-f5be94a61044.jpg',
			'5327df86-6163-40fc-a329-2631494e59f4.jpg',
			'70db653b-3f8f-4114-8bc7-8bb652060e4f.jpg',
			'18c6abe1-398c-41d6-9aae-d50abe9d5f6c.jpg',
			'007d1272-14f8-454b-bf48-2b58aebf97db.jpg',
		];

		for (const iterator of corruptedFileEmployeeData) {
			const isExistCorruptedEmployeeFile = await loginUserRepo
				.get({
					where: { profileImage: iterator, deletedAt: null },
				})
				.then((dat) => parse(dat));

			if (isExistCorruptedEmployeeFile) {
				await loginUserRepo.update(
					{
						profileImage: null,
					},
					{
						where: {
							id: isExistCorruptedEmployeeFile.id,
							deletedAt: null,
						},
						transaction,
					},
				);
			}
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Corrupted Employee Profile Photo Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
