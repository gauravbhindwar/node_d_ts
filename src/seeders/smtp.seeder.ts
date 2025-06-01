import SmtpRepo from 'repository/smtp.repository';
const smtpRepo = new SmtpRepo();
const smtp = [
	{
		host: 'smtp.dreamhost.com',
		port: 465,
		secure: true,
		username: 'developer@esparkbizmail.com',
		password: 't7qI2b@8wu5M',
		isDefault: true,
	},
];

(async function injectSettings(): Promise<void> {
	for (const data of smtp) {
		//Check setting already exist or not
		const smtpData = await smtpRepo.get({
			where: { host: data.host, username: data.username },
		});
		if (smtpData) {
			await smtpRepo.update(data, {
				where: {
					id: smtpData.id,
				},
			});
		}
		if (!smtpData) await smtpRepo.create(data);
	}
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('info', 'smtp Data added successfully...');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('error.', err.message);
	});
