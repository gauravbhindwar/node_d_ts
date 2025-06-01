import db from '@/models';
import LoginUser from '@/models/loginUser.model';
import ClientRepo from '@/repository/client.repository';

(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		const clientRepo = new ClientRepo();
		const isExistClient = await clientRepo.get({
			include: [
				{
					model: LoginUser,
					where: {
						name: 'Schlumberger',
					},
					attributes: ['name'],
				},
			],
			attributes: ['id'],
			transaction,
		});
		if (!isExistClient?.contractTagline && !isExistClient?.contractN) {
			await clientRepo.update(
				{
					contractN: 'CW2972991',
					contractTagline: `« Services Pétroliers Schlumberger et Compagnie d'Operations Pétrolières Schlumberger`,
				},
				{ where: { id: isExistClient.id } },
			);
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Client Details Updated Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
