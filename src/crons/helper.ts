import { FRONTEND_URL, SERVER_URL } from '@/config';
import { medicalRequestStatus } from '@/interfaces/model/medicalRequest.interface';
import { queueStatus } from '@/interfaces/model/queue.interface';
import { transportStatus } from '@/interfaces/model/transport.request.interface';
import db from '@/models';
import Client from '@/models/client.model';
import ContractTemplate from '@/models/contractTemplete.model';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import Feature from '@/models/feature.model';
import LoginUser from '@/models/loginUser.model';
import MedicalRequest from '@/models/medicalRequest.model';
import MedicalType from '@/models/medicalType.model';
import Message from '@/models/message.model';
import MessageDetail from '@/models/messageDetail.model';
import Permission from '@/models/permission.model';
import Queue from '@/models/queue.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import Role from '@/models/role.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TransportDriver from '@/models/transport.driver.model';
import TransportRequest from '@/models/transport.request.model';
import TransportRequestVehicle from '@/models/transport.request.vehicle.model';
import TransportVehicle from '@/models/transport.vehicle.model';
import User from '@/models/user.model';
import UserPermission from '@/models/userPermission.model';
import UserSegment from '@/models/userSegment.model';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import { folderExistCheck, parse } from '@/utils/common.util';
import { logger } from '@/utils/logger';
import { pdf } from '@/utils/puppeteer.pdf';
import Queues from '@/utils/queue';
import _ from 'lodash';
import moment from 'moment';
import path from 'path';
import { Op, Sequelize } from 'sequelize';

export const runCron = async () => {
	let data = await Message.findAll({
		paranoid: false,
		where: {
			isSchedule: true,
			scheduleDate: {
				[Op.gte]: Sequelize.literal("NOW() - (INTERVAL '5 MINUTE')"),
			},
		},
		include: [
			{
				model: MessageDetail,
				required: false,
				attributes: ['employeeId', 'messageId', 'segmentId'],
				include: [
					{
						model: Employee,
						required: false,
						attributes: ['id', 'loginUserId'],
						include: [
							{
								model: LoginUser,
								attributes: ['email', 'firstName', 'lastName', 'phone'],
							},
						],
					},
					{
						model: Segment,
						attributes: ['id'],
						include: [
							{
								model: Employee,
								attributes: ['id', 'loginUserId'],
								include: [
									{
										model: LoginUser,
										attributes: ['email', 'firstName', 'lastName', 'phone'],
									},
								],
							},
						],
					},
				],
			},
		],
	});
	data = parse(data);
	if (!_.isUndefined(data)) {
		data.forEach((item) => {
			buildDataArr(item);
		});
	}
};
const buildDataArr = async (itemValue) => {
	const dataValue: any = [];
	itemValue.messageDetail.forEach((value) => {
		if (value.employeeDetail !== null) {
			dataValue.push({
				email: value.employeeDetail.loginUserData.email,
				firstName: value.employeeDetail.loginUserData.firstName,
				lastName: value.employeeDetail.loginUserData.lastName,
				mobileNumber: value.employeeDetail.loginUserData.phone,
				message: itemValue.message,
			});
		}

		if (value.segmentDetail !== null) {
			value.segmentDetail.employee.forEach((element) => {
				dataValue.push({
					email: element.loginUserData.email,
					firstName: element.loginUserData.firstName,
					lastName: element.loginUserData.lastName,
					mobileNumber: element.loginUserData.phone,
					message: itemValue.message,
				});
			});
		}

		dataValue.forEach((itemData) => {
			buildObject(itemData);
		});
	});
};
const buildObject = async (item) => {
	const employeeData = {
		email: item.email,
		firstName: item.firstName,
		lastName: item.lastName,
		mobileNumber: item.mobileNumber,
		message: item.message,
		logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
	};
	if (item.email) {
		// await sendMail([item.email,'admin@lred.com'], 'Email', 'employeeEmail', employeeData);
	}
};

export const findQueueFunction = async () => {
	try {
		const queue = new Queues();
		const data = await Queue.findOne({
			where: {
				status: {
					[Op.or]: [
						{
							[Op.eq]: queueStatus.INPROGRESS,
						},
						{
							[Op.eq]: queueStatus.RETAKE,
						},
						{
							[Op.eq]: queueStatus.PENDING,
						},
					],
				},
			},
			order: [['id', 'asc']],
		});
		if (data) {
			await queue.processQueue({ data });
		}
	} catch (error) {
		console.log({ error });
	}
};

export const takeNextDataInQueue = async () => {
	const isDataInProgress = await Queue.findOne({
		where: {
			status: queueStatus.INPROGRESS,
		},
	});
	if (!isDataInProgress) {
		await findQueueFunction();
	}
};

export const generateTimesheet = async () => {
	logger.info('generate timesheet started ');
	let autoUpdateEndDateClientList = await Client.findAll({
		attributes: ['id', 'code', 'autoUpdateEndDate', 'endDate'],
		where: {
			endDate: {
				[Op.between]: [
					moment(moment().add(20, 'days').startOf('day')).toDate(),
					moment(moment().add(20, 'days').endOf('day')).toDate(),
				],
			},
			autoUpdateEndDate: {
				[Op.gt]: 0,
			},
		},
	});
	autoUpdateEndDateClientList = parse(autoUpdateEndDateClientList);
	for (const tempTimeSheetData of autoUpdateEndDateClientList) {
		const transaction = await db.transaction();
		try {
			let allEmployeeData = await Employee.findAll({
				attributes: ['id', 'clientId'],
				where: {
					deletedAt: null,
					clientId: tempTimeSheetData.id,
					terminationDate: null,
					segmentId: {
						[Op.ne]: null,
					},
				},
				transaction,
			});
			allEmployeeData = parse(allEmployeeData);
			const createData = [];
			const clientEndDate = moment(moment(tempTimeSheetData?.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY')
				.add(tempTimeSheetData?.autoUpdateEndDate, 'month')
				.toDate();
			for (const tempAllEmployeeData of allEmployeeData) {
				createData.push({
					employeeId: tempAllEmployeeData?.id,
					clientId: tempAllEmployeeData?.clientId,
					processName: 'TIMESHEET_EXTENSION',
					clientEndDate,
				});
			}
			if (createData?.length > 0) {
				await Queue.bulkCreate(createData, { transaction });
			}
			await Client.update(
				{
					endDate: clientEndDate,
				},
				{ where: { id: tempTimeSheetData?.id }, transaction,  individualHooks: true },
			);
			await transaction.commit();
		} catch (error) {
			console.log({ error });
			await transaction.rollback();
		}
	}
	logger.info('generate timesheet completed');
};

// *****************Reliquat Email Functionality *****************

export const reliquatMailFire = async () => {
	const reliquatCalaculationData = await ReliquatCalculation.findAll({
		where: {
			endDate: {
				[Op.eq]: moment(moment().startOf('day')).toDate(),
			},
		},
		attributes: ['id', 'reliquat', 'startDate', 'endDate'],
		include: [
			{
				model: Employee,
				attributes: ['id', 'employeeNumber'],
				include: [
					{
						model: Client,
						attributes: ['id'],
						include: [
							{
								model: LoginUser,
								attributes: ['name'],
							},
						],
					},
					{
						model: LoginUser,
						attributes: ['email', 'firstName', 'lastName'],
					},
				],
			},
		],
	});
	if (reliquatCalaculationData?.length > 0) {
		for (const reliquatData of reliquatCalaculationData) {
			const email = reliquatData?.employee?.loginUserData?.email ?? null;
			const emails = [];
			emails.push('admin@lred.com');
			if (email) {
				emails.push(email);
			}
			// if (email) {
			const replacement = {
				client: reliquatData?.employee?.client?.loginUserData?.name,
				firstName: reliquatData?.employee?.loginUserData?.firstName,
				lastName: reliquatData?.employee?.loginUserData?.lastName,
				employeeNumber: reliquatData?.employee?.employeeNumber,
				email: email,
				mailHeader: `Reliquat Details`,
				message: `Your Reliquat generated as of month ${moment(reliquatData?.startDate).format('MMM')}-${moment(
					reliquatData?.endDate,
				).format('MMM')} is ${reliquatData?.reliquat}`,
				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
				checkReliquatUrl:
					reliquatData?.employee?.id && reliquatData?.employee?.client?.id
						? FRONTEND_URL +
						  `/employee/reliquat-calculation/${reliquatData?.employee?.id}_${reliquatData?.employee?.client?.id}`
						: '',
			};
			// await sendMail(emails, 'Reliquat Details', 'generalMailTemplate', replacement);

		}
	}
};

// *****************************************************************************************

// ********************** Generate Reliquat Calculation On Mid-night ***********************

export const runReliquatCalculationCron = async () => {
	const reliquatCalculationRepo = new ReliquatCalculationRepo();
	const currentDate = moment(moment(new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').add(1, 'month').startOf('month');
	const lastDayOfNextMonth = currentDate.clone().add(2, 'month').endOf('month');
	const dateString = moment(moment(new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').add(15, 'days').toDate();
	const dayNumber = moment(dateString).date();

	const clientData = await Client.findAll({
		where: {
			[Op.or]: [
				{
					timeSheetStartDay: dayNumber,
					// 26dayNumber
				},
				{
					timeSheetStartDay: dayNumber + 1,
					// 26 + 1
				},
			],
		},
	}).then((data) => parse(data));

	if (clientData && clientData.length > 0) {
		for (const iterator of clientData) {
			const empData = await Employee.findAll({
				where: {
					deletedAt: null,
					clientId: iterator.id,
				},
			}).then((dat) => parse(dat));

			for (const empId of empData) {
				await db.transaction(async (transaction) => {
					const timesheetData = await Timesheet.findAll({
						where: {
							clientId: iterator.id,
							employeeId: empId.id,
							[Op.and]: [
								{
									startDate: {
										[Op.gt]: moment(moment(new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
									},
								},
								{
									endDate: {
										[Op.lte]: lastDayOfNextMonth.toDate(),
									},
								},
							],
						},
						order: [['startDate', 'asc']],
						transaction,
					}).then((dat) => parse(dat));
					if (timesheetData && timesheetData.length > 0) {
						for (const timesheetIterator of timesheetData) {
							await reliquatCalculationRepo.addReliquatCalculationService(
								{
									employeeId: String(timesheetIterator?.employeeId),
									timesheetId: timesheetIterator?.id,
									userId: null,
								},
								transaction,
							);
						}
					}
				});
			}
		}
	}
};

// ********************** Completed Reliquat Calculation On Mid-night **********************
export const runCronEveryDay = async () => {
	let driverData = await TransportDriver.findAll({
		attributes: ['id', 'unavailableDates'],
	});
	let vehicleData = await TransportVehicle.findAll({
		attributes: ['id', 'unavailableDates'],
	});
	let transportRequest = await TransportRequest.findAll({
		where: {
			deletedAt: null,
		},
		attributes: ['id', 'status', 'startDate', 'destinationDate'],
		include: [
			{
				model: TransportRequestVehicle,
				where: { deletedAt: null },
				attributes: ['id', 'requestId', 'vehicleId', 'driverId'],
				required: true,
			},
		],
	});

	driverData = parse(driverData);
	vehicleData = parse(vehicleData);
	transportRequest = parse(transportRequest);

	let table = '';

	// *****************Medical Email Functionality (Medical Request Email Today)*****************
	let medicalEmailData = await MedicalRequest.findAll({
		where: {
			medicalDate: {
				[Op.eq]: moment(moment().startOf('day')).toDate(),
			},
		},
		include: [
			{
				model: MedicalType,
				required: true,
				attributes: ['name', 'id', 'daysExpiry'],
			},
			{
				model: Employee,
				attributes: ['id', 'employeeNumber', 'segmentId', 'clientId'],
				include: [
					{
						model: EmployeeSegment,
						as: 'employeeSegment',
						where: {
							date: {
								[Op.lte]: moment().toDate(),
							},
						},
						attributes: ['date', 'id', 'rollover'],
						include: [
							{
								model: Segment,
								as: 'segment',
								attributes: ['slug', 'name', 'id'],
							},
							{
								model: SubSegment,
								as: 'subSegment',
								attributes: ['slug', 'name', 'id'],
							},
						],
					},
					{
						model: Client,
						attributes: ['id', 'medicalEmailToday'],
						include: [{ model: LoginUser, attributes: ['name'] }],
					},
					{
						model: LoginUser,
						attributes: ['id', 'email', 'firstName', 'lastName'],
					},
				],
				order: [['employeeSegment', 'date', 'desc']],
			},
			{
				model: User,
				as: 'createdByUser',
				attributes: ['id', 'loginUserId'],
				include: [{ model: LoginUser, attributes: ['name', 'email'] }],
			},
		],
		attributes: ['id', 'medicalDate', 'createdAt', 'createdBy', 'reference'],
	});
	medicalEmailData = parse(medicalEmailData);

	const segmentArr = new Map();
	for (const data of medicalEmailData) {
		const isExistSegment = segmentArr?.get(data.employee?.segmentId);
		if (!isExistSegment) {
			const arr = [];
			arr.push(data);
			segmentArr.set(data?.employee?.segmentId, arr);
		} else {
			const arr = [...isExistSegment];
			arr.push(data);
			segmentArr.set(data?.employee?.segmentId, arr);
		}
	}

	let email;
	const values = [];

	for (const dataArr of segmentArr.values()) {
		values.push(dataArr);
	}

	for (const iterator of values) {
		const worksheetDataArray = [];
		const pdfPaths = [];

		const resizeHeaderFooter = false;
		const footerContent = `Submitted by ${medicalEmailData[0]?.createdByUser?.loginUserData?.name} on ${moment(
			medicalEmailData[0]?.createdAt,
		).format('DD MMMM YYYY')} at ${moment(medicalEmailData[0]?.createdAt).format('LT')}`;
		for (const data of iterator) {
			const rowData = {
				Reference: data.reference,
				Matricule: data.employee.employeeNumber,
				Name: `${data.employee.loginUserData.firstName} ${data.employee.loginUserData.lastName}`,
				Email: data.employee.loginUserData.email ?? '-',
				'Medical Date': moment(data.medicalDate).format('DD/MM/YYYY'),
				'Medical Type': data.medicalTypeData.name,
			};
			worksheetDataArray.push(rowData);

			if (data.employee.client.medicalEmailToday || data.employee.client.medicalEmailToday !== '') {
				email = data.employee.client.medicalEmailToday.split(',');
				email.unshift(data.employee.loginUserData.email);
			} else {
				email.push(data.employee.loginUserData.email);
			}
			if (!email.includes('admin@lred.com')) {
				email.push('admin@lred.com');
			}

			let typeList = `<td style="border: 1px solid #000; padding: 10px 0 0;">`;
			typeList += `<p
				style="
				  font-size: 14px;
				  font-weight: 400;
				  line-height: 18px;
				  margin: 0 0 5px;
				  display: flex;
				  color:#6B070D ;
				  "
			  >
				<span class="icon">
				  <svg
					xmlns="http://www.w3.org/2000/svg"
					height="16"
					viewBox="0 -960 960 960"
					width="16"
					class="fill-current w-3 h-3 inline-block text-primaryRed"
				  >
					<path
					  d="M400-318 247-471l42-42 111 111 271-271 42 42-313 313Z"
					  fill="#6B070D"
					></path>
				  </svg>
				</span>
				${data?.medicalTypeData?.name}
			  </p>`;

			typeList += `</td>`;
			const refNumber = data.reference.replaceAll('/', '');
			const pdfName = `${moment().unix()}-${refNumber}-medical-request.pdf`;
			const pdfReplacement = {
				status: data.status,
				reference: data.reference,
				medicalDate: moment(data.medicalDate).format('DD MMMM YYYY'),
				firstName: data.employee.loginUserData.firstName,
				lastName: data.employee.loginUserData.lastName,
				employeeNumber: data.employee.employeeNumber,
				email: data.employee.loginUserData.email,
				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
				typeList: typeList,
			};

			await pdf(pdfReplacement, pdfName, 'medicalPdf', false, resizeHeaderFooter, null, footerContent);
			const publicFolder = path.join(__dirname, '../../secure-file/');
			folderExistCheck(publicFolder);
			const filePaths = path.join(publicFolder, `medicalPdf/${pdfName}`);
			pdfPaths.push(filePaths);
		}

		// if (!excelFileCreated) {
		// 	const ws = XLSX.utils.json_to_sheet(worksheetDataArray);
		// 	const wb = XLSX.utils.book_new();
		// 	XLSX.utils.book_append_sheet(wb, ws, 'MedicalEmailData');
		// 	const publicFolder = path.join(__dirname, '../../secure-file/');
		// 	folderExistCheck(publicFolder);
		// 	filePath = path.join(publicFolder, `medicalEmailData/medicalEmailData.xlsx`);
		// 	XLSX.writeFile(wb, filePath);
		// 	excelFileCreated = true;
		// }

		const segment =
			iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name &&
			iterator?.[0]?.employee?.employeeSegment?.[0]?.subSegment?.name
				? `${iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name}-${iterator?.[0]?.employee?.employeeSegment?.[0]?.subSegment?.name}`
				: iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name
				? `${iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name}`
				: '-';

		const replacement = {
			logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
			client: iterator?.[0]?.employee?.client?.loginUserData?.name,
			segment: segment ?? '-',
			message: `Daily medical check has been generated for the client ${iterator[0]?.employee?.client?.loginUserData?.name}.`,
			messageDetail: `Kindly check the sheet attached to find the list of Employees for the Medical check with there Voucher attached in it.`,
			mailHeader: `Medical Check Details`,
			worksheetDataArray,
		};

		if (email && email.length > 0) {
		// await sendMail(
		// 	email,
		// 	'Medical Request Details',
		// 	'generalMailMedicalTemplate',
		// 	replacement,
		// 	[...pdfPaths.map((pdfPath) => ({ path: pdfPath }))],
		// 	undefined,
		// 	undefined,
		// 	false,
		// );
		}
	}

	// *****************************************************************************************

	driverData.forEach((item) => {
		table = 'driverData';
		checkDate(item, table);
	});

	vehicleData.forEach((item) => {
		table = 'vehicleData';
		checkDate(item, table);
	});

	for (const item of transportRequest) {
		table = 'transportRequest';
		checkDate(item, table);
	}
};

// *****************Medical Email Functionality (Medical Request Email Monthly)*****************

export const runCronEveryMonth = async () => {
	let medicalEmailData = await MedicalRequest.findAll({
		where: {
			medicalDate: {
				[Op.or]: {
					[Op.between]: [moment(moment().startOf('day')).toDate(), moment(moment().endOf('month')).toDate()],
					[Op.eq]: moment(moment().startOf('day')).toDate(),
					// [Op.eq]: moment(moment().endOf('day')).toDate(),
				},
			},
		},
		include: [
			{
				model: MedicalType,
				required: true,
				attributes: ['name', 'id', 'daysExpiry'],
			},
			{
				model: Employee,
				attributes: ['id', 'employeeNumber', 'segmentId', 'clientId'],
				include: [
					{
						model: EmployeeSegment,
						as: 'employeeSegment',
						where: {
							date: {
								[Op.lte]: moment().toDate(),
							},
						},
						attributes: ['date', 'id', 'rollover'],
						include: [
							{
								model: Segment,
								as: 'segment',
								attributes: ['slug', 'name', 'id'],
							},
							{
								model: SubSegment,
								as: 'subSegment',
								attributes: ['slug', 'name', 'id'],
							},
						],
					},
					{
						model: Client,
						attributes: ['id', 'medicalEmailMonthly'],
						include: [{ model: LoginUser, attributes: ['name'] }],
					},
					{
						model: LoginUser,
						attributes: ['id', 'email', 'firstName', 'lastName'],
					},
				],
				order: [['employeeSegment', 'date', 'desc']],
			},
		],
		attributes: ['id', 'medicalDate', 'createdAt', 'reference'],
	});
	medicalEmailData = parse(medicalEmailData);

	const segmentArr = new Map();
	for (const data of medicalEmailData) {
		const isExistSegment = segmentArr?.get(data.employee?.segmentId);
		if (!isExistSegment) {
			const arr = [];
			arr.push(data);
			segmentArr.set(data?.employee?.segmentId, arr);
		} else {
			const arr = [...isExistSegment];
			arr.push(data);
			segmentArr.set(data?.employee?.segmentId, arr);
		}
	}

	let email;
	const values = [];

	for (const dataArr of segmentArr.values()) {
		values.push(dataArr);
	}

	for (const iterator of values) {
		// // let filePath;
		// // let excelFileCreated = false;

		const worksheetDataArray = [];
		const pdfPaths = [];

		const resizeHeaderFooter = false;
		const footerContent = `Submitted by ${
			medicalEmailData[0]?.employee?.loginUserData?.firstName +
			' ' +
			medicalEmailData[0]?.employee?.loginUserData?.lastName
		} on ${moment(medicalEmailData[0]?.createdAt).format('DD MMMM YYYY')} at ${moment(
			medicalEmailData[0]?.createdAt,
		).format('LT')}`;
		for (const data of iterator) {
			const rowData = {
				Reference: data.reference,
				Matricule: data.employee.employeeNumber,
				Name: `${data.employee.loginUserData.firstName} ${data.employee.loginUserData.lastName}`,
				Email: data.employee.loginUserData.email ?? '-',
				'Medical Date': moment(data.medicalDate).format('DD/MM/YYYY'),
				'Medical Type': data.medicalTypeData.name,
			};
			worksheetDataArray.push(rowData);

			if (data.employee.client.medicalEmailMonthly || data.employee.client.medicalEmailMonthly !== '') {
				email = data.employee.client.medicalEmailMonthly.split(',');
				email.unshift(data.employee.loginUserData.email);
			} else {
				email.push(data.employee.loginUserData.email);
			}
			if (!email.includes('admin@lred.com')) {
				email.push('admin@lred.com');
			}

			let typeList = `<td style="border: 1px solid #000; padding: 10px 0 0;">`;
			typeList += `<p
				style="
				  font-size: 14px;
				  font-weight: 400;
				  line-height: 18px;
				  margin: 0 0 5px;
				  display: flex;
				  color:#6B070D ;
				  "
			  >
				<span class="icon">
				  <svg
					xmlns="http://www.w3.org/2000/svg"
					height="16"
					viewBox="0 -960 960 960"
					width="16"
					class="fill-current w-3 h-3 inline-block text-primaryRed"
				  >
					<path
					  d="M400-318 247-471l42-42 111 111 271-271 42 42-313 313Z"
					  fill="#6B070D"
					></path>
				  </svg>
				</span>
				${data?.medicalTypeData?.name}
			  </p>`;
			typeList += `</td>`;
			const refNumber = data.reference.replaceAll('/', '');
			const pdfName = `${moment().unix()}-${refNumber}-medical-request.pdf`;
			const pdfReplacement = {
				status: data.status,
				reference: data.reference,
				medicalDate: moment(data.medicalDate).format('DD MMMM YYYY'),
				firstName: data.employee.loginUserData.firstName,
				lastName: data.employee.loginUserData.lastName,
				employeeNumber: data.employee.employeeNumber,
				email: data.employee.loginUserData.email,
				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
				typeList: typeList,
			};

			await pdf(pdfReplacement, pdfName, 'medicalPdf', false, resizeHeaderFooter, null, footerContent);
			const publicFolder = path.join(__dirname, '../../secure-file/');
			folderExistCheck(publicFolder);
			const filePaths = path.join(publicFolder, `medicalPdf/${pdfName}`);
			pdfPaths.push(filePaths);
		}

		// if (!excelFileCreated) {
		// 	const ws = XLSX.utils.json_to_sheet(worksheetDataArray);
		// 	const wb = XLSX.utils.book_new();
		// 	XLSX.utils.book_append_sheet(wb, ws, 'MedicalEmailData');
		// 	const publicFolder = path.join(__dirname, '../../secure-file/');
		// 	folderExistCheck(publicFolder);
		// 	filePath = path.join(publicFolder, `medicalEmailData/medicalEmailData.xlsx`);
		// 	XLSX.writeFile(wb, filePath);
		// 	excelFileCreated = true;
		// }

		const segment =
			iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name &&
			iterator?.[0]?.employee?.employeeSegment?.[0]?.subSegment?.name
				? `${iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name}-${iterator?.[0]?.employee?.employeeSegment?.[0]?.subSegment?.name}`
				: iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name
				? `${iterator?.[0]?.employee?.employeeSegment?.[0]?.segment?.name}`
				: '-';

		const replacement = {
			logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
			client: iterator?.[0]?.employee?.client?.loginUserData?.name,
			segment: segment ?? '-',
			message: `Monthly medical check has been generated for the client ${iterator[0]?.employee?.client?.loginUserData?.name}.`,
			messageDetail: `Kindly check the sheet attached to find the list of Employees for the Medical check with there Voucher attached in it.`,
			mailHeader: `Medical Check Details`,
			worksheetDataArray,
		};

		// await sendMail(
		// 	email,
		// 	'Medical Request Details',
		// 	'generalMailMedicalTemplate',
		// 	replacement,
		// 	[...pdfPaths.map((pdfPath) => ({ path: pdfPath }))],
		// 	undefined,
		// 	undefined,
		// 	false,
		// );
	}
};

// *****************************************************************************************

const checkDate = async (item, table) => {
	const currDate = moment().startOf('day');

	if (!_.isEmpty(item.unavailableDates)) {
		const data = [];

		item?.unavailableDates?.split(',').forEach((element) => {
			const splitted = element?.split('-');
			const splittedEndDate = moment(splitted[1], 'DD-MM-YYYY');
			if (splittedEndDate.isSameOrAfter(currDate, 'day')) {
				data.push(splitted.join('-'));
			}
		});

		const finalData = data.join(',');

		if (table === 'driverData') {
			await TransportDriver.update({ unavailableDates: finalData }, { where: { id: item.id },  individualHooks: true });
		} else if (table === 'vehicleData') {
			await TransportVehicle.update({ unavailableDates: finalData }, { where: { id: item.id },  individualHooks: true });
		} else {
			console.log('nothing updated');
		}
	}

	if (table === 'transportRequest') {
		const startDate = moment(item.startDate);
		const destinationDate = moment(item.destinationDate);

		if (destinationDate.isSameOrAfter(currDate) && startDate.isSameOrBefore(currDate)) {
			await TransportRequest.update(
				{ status: transportStatus.INPROGRESS },
				{ where: { id: item.id, deletedAt: null },  individualHooks: true },
			);
		} else if (currDate > destinationDate) {
			await TransportRequest.update({ status: transportStatus.COMPLETED }, { where: { id: item.id, deletedAt: null },  individualHooks: true });
		} else {
			await TransportRequest.update({ status: transportStatus.STARTED }, { where: { id: item.id, deletedAt: null },  individualHooks: true });
		}
	}
};

// User Destroy When Employee terminate
export const userDestroy = async () => {
	const result = await Employee.findAll({
		where: { terminationDate: { [Op.not]: null } },
		attributes: ['id', 'loginUserId', 'terminationDate'],
	});
	if (result.length) {
		const employeeList = result?.filter(
			(val) => moment(val.terminationDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'),
		);
		for (const employee of employeeList) {
			const user = await User.findOne({ where: { loginUserId: employee.loginUserId } });
			if (user) {
				await User.destroy({ where: { loginUserId: user.loginUserId } });
				await UserPermission.destroy({ where: { loginUserId: user.loginUserId, roleId: user.roleId } });
			}
		}
	}
};

// Send mail to employee for contract end after 4 weeks and every week before contract end or update
export const contractEndBefore = async () => {
	try {
		const fourWeekDate = moment().add(4, 'weeks').format('YYYY-MM-DD');
		const threeWeekDate = moment().add(3, 'weeks').format('YYYY-MM-DD');
		const twoWeekDate = moment().add(2, 'weeks').format('YYYY-MM-DD');
		const oneWeekDate = moment().add(1, 'weeks').format('YYYY-MM-DD');
		const replacementArr = await contractEndHelperFun([fourWeekDate, threeWeekDate, twoWeekDate, oneWeekDate]);

		if (replacementArr.length > 0) {
			for (const mailData of replacementArr) {
				if (mailData?.emails?.length > 0) {
					// await sendMail(mailData.emails, 'End of Contract Notification', 'contractEndWeekly', mailData.replacement);
				}
			}
		}
	} catch (error) {
		console.log({ error });
	}
};

export const contractEndHelperFun = async (dateArray: string[]) => {
	try {
		const employeeData = await Employee.findAll({
			where: {
				deletedAt: null,
				terminationDate: null,
			},
			include: [
				{
					model: User,
					as: 'createdByUser',
					attributes: ['id', 'loginUserId'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
				{
					model: LoginUser,
					required: true,
					attributes: ['firstName', 'lastName', 'email'],
				},
				{
					model: EmployeeContract,
					attributes: ['endDate', 'id', 'description', 'newContractNumber'],
					where: {
						endDate: {
							[Op.ne]: null,
						},
					},
					separate: true,
					limit: 1,
					order: [['endDate', 'desc']],
				},
				{
					model: Segment,
					attributes: ['name'],
				},
				{
					model: SubSegment,
					attributes: ['name'],
				},
				{
					model: Rotation,
					attributes: ['name'],
				},
				{
					model: Client,
					attributes: ['id'],
					include: [
						{
							model: LoginUser,
							attributes: ['name'],
						},
					],
				},
			],
		});
		const managerRoleData = await Role.findOne({
			where: {
				name: 'manager',
			},
			attributes: ['id'],
		});
		const permissionIds = await Permission.findAll({
			where: {
				permissionName: {
					// [Op.eq]: 'approve',
					[Op.any]: ['update', 'approve'],
				},
			},
			attributes: ['id'],
			include: [
				{
					model: Feature,
					required: true,
					where: {
						name: 'Timesheet',
					},
					attributes: ['id'],
				},
			],
		});
		const permissionIdsArr = permissionIds.map((e) => e.id);
		const permissionIdsString = permissionIdsArr.join(',');
		const userQuery = `SELECT u.id,u."loginUserId"
			FROM users u
			LEFT JOIN login_user lu ON lu.id = u."loginUserId"
			LEFT JOIN user_permission up ON up."loginUserId" = lu.id
			left join user_segment us on us."userId" = u.id
			LEFT JOIN "permission" p ON up."permissionId" = p.id
			WHERE u."roleId" = ${managerRoleData?.id} AND u."status" = 'ACTIVE' AND p.id IN (${permissionIdsString}) and up."deletedAt" is null
			GROUP BY u.id
			HAVING COUNT(DISTINCT p.id) = 2;`;
		const userIds = await db.query(userQuery);
		const userIdsData = userIds[0].map((e: { id: number; loginUserId: number }) => e.id);
		// let allEmails = [];
		const excelData = new Map();
		const replacementArr: {
			segment: string;
			replacement: { logourl: string; segment: string; clientName: string; worksheetDataArray: unknown[] };
			// filePath: string;
			emails: [];
		}[] = [];
		for (const data of employeeData) {
			let emails = [];
			let endDate = null;
			let contractNumber = null;
			const isExistcontractData = await EmployeeContract.findAll({
				where: {
					employeeId: data?.id,
					deletedAt: null,
				},
				attributes: ['endDate'],
				include: [
					{
						model: User,
						as: 'createdByUser',
						attributes: ['id', 'loginUserId'],
						include: [{ model: LoginUser, attributes: ['name', 'email'] }],
					},
					{
						model: ContractTemplate,
						attributes: ['contractName', 'id'],
					},
				],
				order: [['endDate', 'desc']],
			});
			if (data.segmentId) {
				const userSegmentData = await User.findAll({
					include: [
						{
							model: LoginUser,
							required: true,
							attributes: ['email'],
						},
						{
							model: UserSegment,
							attributes: ['id'],
							required: true,
							where: {
								userId: {
									[Op.in]: userIdsData,
								},
								...(data.segmentId && { segmentId: data.segmentId }),
								...(data.subSegmentId && { subSegmentId: data.subSegmentId }),
							},
						},
					],
				});
				const managerEmails = userSegmentData?.map((e) => e?.loginUserData?.email);
				emails = [...emails, ...managerEmails];
				if (data?.segmentId && data?.subSegmentId) {
					excelData.set(`${data.segmentId}-${data.subSegmentId}`, {
						emails,
						employees: [...(excelData.get(`${data.segmentId}-${data.subSegmentId}`)?.employees ?? [])],
					});
				} else if (data?.segmentId && !data?.subSegmentId) {
					excelData.set(`${data.segmentId}`, {
						emails,
						employees: [...(excelData.get(`${data.segmentId}`)?.employees ?? [])],
					});
				}
			} else {
				excelData.set(`c-${data?.clientId}`, {
					emails: [],
					employees: [...(excelData.get(`c-${data?.clientId}`)?.employees ?? [])],
				});
			}
			if (data?.contractEndDate) {
				if (isExistcontractData.length) {
					const result = isExistcontractData.find((contract) =>
						moment(moment(contract.endDate).format('YYYY-MM-DD')).isAfter(
							moment(moment(data.contractEndDate).format('YYYY-MM-DD')),
						),
					);
					if (result === undefined) {
						endDate = moment(data.contractEndDate).format('YYYY-MM-DD');
						contractNumber = data.contractNumber;
					}
				} else {
					endDate = moment(data.contractEndDate).format('YYYY-MM-DD');
					contractNumber = data.contractNumber;
				}
				// data?.loginUserData?.email && emails.push(data?.loginUserData?.email);
				data.createdByUser?.loginUserData?.email && emails.push(data.createdByUser?.loginUserData?.email);
			} else if (isExistcontractData.length > 0) {
				endDate = moment(isExistcontractData[0].endDate).format('YYYY-MM-DD');
				contractNumber = isExistcontractData[0].newContractNumber;
				isExistcontractData[0]?.createdByUser?.loginUserData?.email &&
					emails.push(isExistcontractData[0]?.createdByUser?.loginUserData?.email);
			}
			if (!emails.includes('admin@lred.com')) {
				emails.push('admin@lred.com');
			}
			if (!emails.includes('hr.manager@lred.com')) {
				emails.push('hr.manager@lred.com');
			}
			if (contractNumber && endDate && dateArray.includes(endDate)) {
				if (data?.segmentId && data?.subSegmentId) {
					const oldData = excelData.get(`${data?.segmentId}-${data?.subSegmentId}`);
					excelData.set(`${data?.segmentId}-${data?.subSegmentId}`, {
						emails: oldData.emails,
						employees: [
							...oldData.employees,
							{
								name: data?.loginUserData?.lastName + ' ' + data?.loginUserData?.firstName,
								employeeNumber: data.employeeNumber,
								contractNumber: contractNumber,
								rotationName: data?.rotation?.name,
								endDate,
								segment: data.segment.name,
								subSegment: data.subSegment.name,
								clientName: data?.client?.loginUserData?.name,
							},
						],
					});
				} else if (data?.segmentId && !data?.subSegmentId) {
					const oldData = excelData.get(`${data?.segmentId}`);
					excelData.set(`${data?.segmentId}`, {
						emails: oldData.emails,
						employees: [
							...oldData.employees,
							{
								name: data?.loginUserData?.lastName + ' ' + data?.loginUserData?.firstName,
								employeeNumber: data.employeeNumber,
								contractNumber: contractNumber,
								rotationName: data?.rotation?.name,
								endDate,
								segment: data.segment.name,
								clientName: data?.client?.loginUserData?.name,
							},
						],
					});
				} else {
					const oldData = excelData.get(`c-${data?.clientId}`);
					excelData.set(`c-${data?.clientId}`, {
						emails: oldData.emails,
						employees: [
							...oldData.employees,
							{
								name: data?.loginUserData?.lastName + ' ' + data?.loginUserData?.firstName,
								employeeNumber: data.employeeNumber,
								contractNumber: contractNumber,
								rotationName: data?.rotation?.name,
								endDate,
								clientName: data?.client?.loginUserData?.name,
							},
						],
					});
				}
			}

			excelData.forEach((val, key) => {
				if (!(val?.employees?.length > 0)) {
					excelData.delete(key);
				}
			});
			// let fileName = '';
			excelData.forEach(async (value) => {
				const segment = `${value?.employees?.[0]?.segment ?? '-'}${
					value?.employees?.[0]?.subSegment ? ' - ' + value?.employees?.[0]?.subSegment : ''
				}`;

				// fileName = '';
				const worksheetDataArray = [];
				value?.employees?.map((employee) => {
					const rowData = {
						Matricule: employee?.employeeNumber ?? '-',
						Name: employee?.name ?? '-',
						'Contract Number': employee?.contractNumber ?? '-',
						Segment: `${employee?.segment ?? '-'}${employee?.subSegment ? ' - ' + employee.subSegment : ''}`,
						Rotation: employee.rotationName ?? '-',
						'Contract End Date': employee.endDate ?? '-',
					};
					// fileName = `${employee?.segment ?? '-'}${employee?.subSegment ? ' - ' + employee.subSegment : ''}`;
					worksheetDataArray.push(rowData);
				});
				const replacement = {
					logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
					clientName: value?.employees?.[0]?.clientName ?? '-',
					segment: `${value?.employees?.[0]?.segment ?? '-'}${
						value?.employees?.[0]?.subSegment ? ' - ' + value?.employees?.[0]?.subSegment : ''
					}`,
					worksheetDataArray,
				};

				// const ws = XLSX.utils.json_to_sheet(worksheetDataArray);
				// const wb = XLSX.utils.book_new();
				// XLSX.utils.book_append_sheet(wb, ws, 'ContractEndData');
				// const publicFolder = path.join(__dirname, '../../secure-file/');
				// folderExistCheck(publicFolder);
				// const folderPath = path.join(publicFolder, `contractExcel`);
				// folderExistCheck(folderPath);
				// const filePath = path.join(folderPath, `${fileName}.xlsx`);
				// XLSX.writeFile(wb, filePath);
				const isExist = replacementArr.findIndex(
					(e) =>
						e.segment ===
						`${value?.employees?.[0]?.segment ?? '-'}${
							value?.employees?.[0]?.subSegment ? ' - ' + value?.employees?.[0]?.subSegment : ''
						}`,
				);
				if (isExist < 0) {
					replacementArr.push({ segment, replacement, emails: value.emails });
				} else {
					const index = replacementArr.findIndex((e) => e.segment === segment);
					if (index >= 0) {
						replacementArr[index].replacement = replacement;
					}
				}
			});
		}
		return replacementArr;
	} catch (error) {
		throw new Error(error);
	}
};

// Send mail to employee for his medical request
export const medicalExpiryBefore = async () => {
	const fourWeekDate = moment().add(4, 'weeks').format('YYYY-MM-DD');
	const threeWeekDate = moment().add(3, 'weeks').format('YYYY-MM-DD');
	const twoWeekDate = moment().add(2, 'weeks').format('YYYY-MM-DD');
	const oneWeekDate = moment().add(1, 'weeks').format('YYYY-MM-DD');
	const employeeData = await Employee.findAll({
		where: {
			deletedAt: null,
			terminationDate: null,
		},
		include: [
			{
				model: Client,
				attributes: ['id', 'stampLogo', 'medicalEmailSubmission'],
				include: [
					{
						model: LoginUser,
						attributes: ['name', 'firstName', 'lastName', 'email'],
					},
				],
			},
			{
				model: User,
				as: 'createdByUser',
				attributes: ['id', 'loginUserId'],
				include: [{ model: LoginUser, attributes: ['name', 'email'] }],
			},
			{
				model: LoginUser,
				attributes: ['firstName', 'lastName', 'email'],
			},
			{
				model: MedicalRequest,
				required: true,
				where: { status: medicalRequestStatus.ACTIVE },
				attributes: ['reference', 'medicalTypeId', 'medicalExpiry', 'medicalDate', 'status'],
				include: [
					{
						model: MedicalType,
						attributes: ['name'],
					},
					{
						model: User,
						as: 'createdByUser',
						attributes: ['id', 'loginUserId'],
						include: [{ model: LoginUser, attributes: ['name', 'email'] }],
					},
				],
			},
		],
	});
	for (const data of employeeData) {
		let expiryDate = [];
		if (data.medicalRequest?.length > 0) {
			expiryDate = expiryDate.concat(
				data.medicalRequest?.map((medical) => {
					return {
						type: medical.medicalTypeId,
						employeeData: data,
						typeData: medical?.medicalTypeData,
						medicalData: medical,
						medicalExpiryDate: moment(medical.medicalExpiry).format('YYYY-MM-DD'),
					};
				}),
			);
		}

		if (expiryDate.length) {
			for (const employee of expiryDate) {
				const empData = employee?.employeeData;
				const emails = [];
				let ccEmail = [];
				if ([fourWeekDate, threeWeekDate, twoWeekDate, oneWeekDate].includes(employee.medicalExpiryDate)) {
					if (empData?.client.medicalEmailSubmission && empData?.medicalEmailSubmission !== '') {
						ccEmail = emails.concat(empData?.employeeData?.client?.medicalEmailSubmission.split(','));
					}
					if (empData?.createdByUser?.loginUserData?.email) {
						emails.push(empData?.createdByUser?.loginUserData?.email);
					}
					if (empData?.loginUserData?.email) {
						emails.push(empData?.loginUserData?.email);
					}
					if (!emails.includes('admin@lred.com')) {
						emails.push('admin@lred.com');
					}

					const medicalTypeListData = await MedicalType.findAll({
						where: {
							deletedAt: null,
						},
						attributes: ['id', 'name', 'format'],
						order: [['name', 'asc']],
					});
					const pdfName = `${moment().unix()}-medical-request.pdf`;
					const resizeHeaderFooter = false;
					const footerContent = `Submitted by ${employee.medicalData.createdByUser.loginUserData.name} on ${moment(
						employee.medicalExpiryDate,
					).format('DD MMMM YYYY')} at ${moment(employee?.medicalData?.createdAt).format('LT')}`;
					let typeList = `<td style="border: 1px solid #000; padding: 10px 0 0;">`;
					medicalTypeListData?.map((item) => {
						if (item.id === employee?.type) {
							typeList += `<p
							style="
							  font-size: 14px;
							  font-weight: 400;
							  line-height: 18px;
							  margin: 0 0 5px;
							  display: flex;
							  color:#6B070D ;
							  "
						  >
							<span class="icon">
							  <svg
								xmlns="http://www.w3.org/2000/svg"
								height="16"
								viewBox="0 -960 960 960"
								width="16"
								class="fill-current w-3 h-3 inline-block text-primaryRed"
							  >
								<path
								  d="M400-318 247-471l42-42 111 111 271-271 42 42-313 313Z"
								  fill="#6B070D"
								></path>
							  </svg>
							</span>
							${item.name}
						  </p>`;
						} else {
							typeList += `<p
							style="
							  font-size: 14px;
							  font-weight: 400;
							  line-height: 18px;
							  margin: 0 0 5px;
							  padding: 0 0 0 20px;
							  "
						  >
						  ${item.name}
						  </p>`;
						}
					});
					typeList += `</td>`;
					const pdfReplacement = {
						status: employee?.medicalData?.status,
						reference: employee?.medicalData?.reference,
						medicalDate: moment(employee?.medicalData?.medicalDate).format('DD MMMM YYYY'),
						firstName: employee?.employeeData?.loginUserData?.firstName,
						lastName: employee?.employeeData?.loginUserData?.lastName,

						employeeNumber: employee?.employeeData?.employeeNumber,
						email: employee?.employeeData?.loginUserData?.email,
						logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
						typeList: typeList,
					};
					const stampLogo = employee?.employeeData?.client?.stampLogo
						? SERVER_URL + employee?.employeeData?.client?.stampLogo
						: null;
					await pdf(pdfReplacement, `${pdfName}`, 'medicalPdf', false, resizeHeaderFooter, stampLogo, footerContent);
					const replacement = {
						client: empData?.client.loginUserData.name,
						firstName: empData?.loginUserData.firstName,
						lastName: empData?.loginUserData.lastName,
						employeeNumber: empData?.employeeNumber,
						logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
						email: empData?.loginUserData.email,
						mailHeader: `Medical Expiry Check Details`,
						message: `The medical ${employee?.typeData?.name} is scheduled to expire on ${moment(
							employee?.medicalExpiryDate,
						).format('DD MMMM YYYY')}.`,
						checkReliquatUrl: '',
					};
					if (emails.length > 0) {
						const publicFolder = path.join(__dirname, '../../secure-file/');
						folderExistCheck(publicFolder);
						const filePath = path.join(publicFolder, `medicalPdf/${pdfName}`);
						// await sendMail(
						// 	emails,
						// 	'Medical Expiry Check Details',
						// 	'generalMailTemplate',
						// 	replacement,
						// 	[{ path: filePath }],
						// 	ccEmail.length ? ccEmail : undefined,
						// );
					}
				}
			}
		}
	}
};
