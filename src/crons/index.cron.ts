import { logger } from '@/utils/logger';
import moment from 'moment';
import cron from 'node-cron';
import {
	contractEndBefore,
	contractEndHelperFun,
	findQueueFunction,
	generateTimesheet,
	medicalExpiryBefore,
	reliquatMailFire,
	runCron,
	runCronEveryDay,
	runReliquatCalculationCron,
	takeNextDataInQueue,
	userDestroy,
} from './helper';
import { sendMail } from '@/helpers/mail.helper';
cron.schedule('*/5 * * * *', async () => {
	logger.info('cron running a task every 5 minute');
	await runCron();
	// if (XeroHelperObject.xeroToken) {
	// 	const tokenSet = await XeroHelperObject.xero.readTokenSet();
	// 	XeroHelperObject.xeroToken = tokenSet;
	// 	await XeroHelperObject.xero.setTokenSet(XeroHelperObject.xeroToken);
	// 	if (await tokenSet.expired()) {
	// 		await XeroHelperObject.getNewTokenSet(tokenSet);
	// 	}
	// 	await XeroHelperObject.xero.initialize();
	// 	await XeroHelperObject.xero.refreshToken();
	// 	XeroHelperObject.xeroToken = await XeroHelperObject.xero.readTokenSet();
	// }
});

findQueueFunction();

cron.schedule('*/5 * * * * *', async () => {
	await takeNextDataInQueue();
});

cron.schedule('0 0 * * *', async () => {
	logger.info('cron running a task every day at mid-night');
	await contractEndBefore();
	await medicalExpiryBefore();
	await reliquatMailFire();
	await runCronEveryDay();
	await runReliquatCalculationCron();
	await userDestroy();
	await generateTimesheet();
});

// Every Next Day at 00:05 AM
cron.schedule('5 0 * * *', async () => {
	logger.info('cron running a task every day at mid-night');
	const currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD');

	const replacementArr = await contractEndHelperFun([currentDate]);

	if (replacementArr.length > 0) {
		for (const mailData of replacementArr) {
			if (mailData?.emails?.length > 0) {
				await sendMail(mailData.emails, 'End of Contract Notification', 'contractEndDaily', mailData.replacement);
			}
		}
	}
});

// For Send mail every day after contract is expired
// Every Next Day at 00:05 AM
// cron.schedule('5 0 * * *', async () => {
// 	logger.info('cron running a task every day at mid-night');
// 	const employeeData = await Employee.findAll({
// 		where: {
// 			deletedAt: null,
// 			terminationDate: null,
// 		},
// 		include: [
// 			{
// 				model: LoginUser,
// 				attributes: ['email', 'firstName', 'lastName'],
// 			},
// 			{
// 				model: EmployeeContract,
// 				attributes: ['endDate', 'id', 'description', 'newContractNumber'],
// 				separate: true,
// 				limit: 1,
// 				order: [['endDate', 'desc']],
// 			},
// 		],
// 	});
// 	const currentDate = moment();
// 	for (const data of employeeData) {
// 		let flag = false;
// 		let endDate = moment(currentDate).format('DD-MM-YYYY');
// 		const attributes = {
// 			where: {
// 				employeeId: data?.id,
// 				deletedAt: null,
// 			},
// 			attributes: ['endDate'],
// 			include: [
// 				{
// 					model: ContractTemplate,
// 					attributes: ['contractName', 'id'],
// 				},
// 			],
// 		};
// 		const isExistcontract = await EmployeeContract.findOne({
// 			...attributes,
// 			order: [['endDate', 'desc']],
// 		});

// 		if (data?.contractEndDate && moment(data.contractEndDate).isBefore(currentDate)) {
// 			const isExistcontractData = await EmployeeContract.findAll(attributes);
// 			if (isExistcontractData.length) {
// 				const result = isExistcontractData.find((contract) =>
// 					moment(moment(contract.endDate).format('YYYY-MM-DD')).isAfter(
// 						moment(moment(data.contractEndDate).format('YYYY-MM-DD')),
// 					),
// 				);
// 				if (result === undefined) {
// 					endDate = moment(data.contractEndDate).format('DD-MM-YYYY');
// 					flag = true;
// 				}
// 			}
// 		} else if (isExistcontract && moment(isExistcontract.endDate).isBefore(currentDate)) {
// 			flag = true;
// 			endDate = moment(isExistcontract.endDate).format('DD-MM-YYYY');
// 		}
// 		if (flag) {
// 			const replacement = {
// 				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
// 				name: data.loginUserData.lastName + ' ' + data.loginUserData.firstName,
// 				endDate: endDate,
// 			};
// 			// if (data.loginUserData.email)
// 			// 	await sendMail(
// 			// 		[data.loginUserData.email,'admin@lred.com'],
// 			// 		'End of Contract Renewal Notification',
// 			// 		'contractRenewal',
// 			// 		replacement,
// 			// 	);
// 		}
// 	}
// });

// *****************Medical Email Functionality (Medical Email Monthly)*****************

// cron.schedule('0 0 1 * *', async () => {
// 	logger.info("cron running a task every month's first Day");
// 	runCronEveryMonth();
// });

// *****************************************************************************************
