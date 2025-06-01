/* eslint-disable no-console */

import { FRONTEND_URL } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { numDate } from '@/helpers/common.helper';
import { sendMail } from '@/helpers/mail.helper';
import { RolePermissionAttributes } from '@/interfaces/model/rolePermission.interface';
import { status } from '@/interfaces/model/user.interface';
import db from '@/models';
import BonusType from '@/models/bonusType.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import User from '@/models/user.model';
import UserPermission from '@/models/userPermission.model';
import { generateUniquePassword, parse } from '@/utils/common.util';
import moment from 'moment';
import path from 'path';
import { Op, Transaction } from 'sequelize';
import XLSX from 'xlsx';

//==============Import Employee User On Database=============

(async function injectUsers(): Promise<void> {
	try {
		const userData = await User.findOne({
			attributes: ['id', 'roleId', 'status', 'loginUserId', 'createdAt'],
			include: [
				{
					model: Role,
					where: { name: 'super admin' },
					attributes: ['name'],
				},
			],
		});
		const workbook = XLSX.readFile(
			path.join(__dirname, `../../public/importEmployeeFile/masterImportEmployeeSheet.xlsx`),
		);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const dataJson = XLSX.utils.sheet_to_json(worksheet, { blankrows: false, defval: '' });
		let dataValue = parse(dataJson);

		dataValue = dataValue.map((element: object) => {
			const newObj = {};
			for (const key in element) {
				newObj[key.replace(/\*/g, '')] = element[key];
			}
			return newObj;
		});
		const findData = dataValue.find(
			(item) =>
				item.Matricule !== '' &&
				item.Email !== '' &&
				item.Forename !== '' &&
				item.Surname !== '' &&
				item.Rotation !== '' &&
				item['Mobile Number'] !== '' &&
				item['Client Id'] !== '' &&
				item['Start Date'] !== '' &&
				item.Fonction !== '',
		);
		if (!findData) {
			throw new HttpException(
				400,
				'An error occurred while importing the sheet Marticule,First Name,Client Id,Last Name,Rotation,Email,Phone Number,Start Date,Fonction are required fields Please make sure to enter the correct data',
				true,
			);
		}

		const promises = [];
		for (const dataItem of dataValue) {
			const transaction = await db.transaction();
			try {
				const clientData = await Client.findOne({
					where: {
						code: dataItem['Client Id'],
					},
				});
				const resp = await checkData(dataItem, userData, clientData?.id, transaction);
				let isExist = await Employee.findOne({
					where: { employeeNumber: dataItem?.Matricule, clientId: clientData?.id, deletedAt: null },
					include: [
						{
							model: SubSegment,
							attributes: ['id'],
						},
						{
							model: Rotation,
							attributes: ['id'],
						},
					],
				});
				isExist = parse(isExist);
				await transaction.commit();
				promises.push({ data: resp, status: 'success', index: dataItem?.Matricule });
			} catch (error) {
				await transaction.rollback();
				promises.push({ data: error, status: 'error', index: dataItem?.Matricule });
			}
		}
		await Promise.all(promises);
	} catch (error) {
		throw new Error(error);
	}

	async function checkData(data: any, user: User, clientId: number, transaction: Transaction = null) {
		try {
			let finalDataValue: any = [];

			const result = await checkSegmentSubSegment(data, clientId, user, transaction);

			const resultRotationValue = await Rotation.findOne({
				where: { name: data.Rotation },
				transaction,
			});
			const resultRotation = parse(resultRotationValue);

			if (!resultRotationValue) {
				throw new HttpException(
					400,
					'An error occurred while importing the sheet Rotation fields Please make sure to enter the correct Rotation data',
					true,
				);
			}

			let isExist = await Employee.findOne({
				where: { employeeNumber: data?.Matricule, clientId: clientId, deletedAt: null },
				include: [
					{
						model: SubSegment,
						attributes: ['id'],
					},
					{
						model: Rotation,
						attributes: ['id'],
					},
				],
				transaction,
			});

			isExist = parse(isExist);

			const dataItem = await generateDataItem(data, result, resultRotation);
			const loginData = await generateLoginData(dataItem);
			const bonusData = await generateBonusData(dataItem);
			const bonusArrayData = await bonusArray(bonusData);

			if (bonusArrayData && bonusArrayData.length > 0) {
				finalDataValue = await finalData(bonusArrayData, transaction);
			}

			finalDataValue = finalDataValue.flat();
			finalDataValue = JSON.stringify({ data: finalDataValue });
			const parsedFinalData = JSON.parse(finalDataValue);

			const valueOfData = await generateValueOfData(clientId, data, dataItem, parsedFinalData, finalDataValue);
			const employeeResult = await handleEmployee(isExist, dataItem, valueOfData, loginData, user, transaction);
			return employeeResult;
		} catch (error) {
			throw new Error(error);
		}
	}

	async function checkSegmentSubSegment(data: any, clientId: number, user: User, transaction: Transaction) {
		let resultSegment, resultSubSegment;

		if (data.Segment !== '' && data['Sub-Segment'] === '') {
			const [result] = await Segment.findOrCreate({
				where: { code: data.Segment.toLowerCase(), deletedAt: null },
				defaults: {
					code: data.Segment.toLowerCase(),
					name: data.Segment.toLowerCase(),
					clientId: clientId,
					createdBy: user.id,
				},
				transaction,
			});

			resultSegment = parse(result);
		}

		if (data.Segment !== '' && data['Sub-Segment'] !== '') {
			const [result] = await Segment.findOrCreate({
				where: { code: data.Segment.toLowerCase(), deletedAt: null },
				defaults: {
					code: data.Segment.toLowerCase(),
					name: data.Segment.toLowerCase(),
					clientId: clientId,
					createdBy: user.id,
				},
				transaction,
			});

			resultSegment = parse(result);

			const [resultSubValue] = await SubSegment.findOrCreate({
				where: { code: data['Sub-Segment'].toLowerCase(), segmentId: resultSegment.id },
				defaults: {
					code: data['Sub-Segment'].toLowerCase(),
					name: data['Sub-Segment'].toLowerCase(),
					segmentId: resultSegment?.id,
					createdBy: user.id,
				},
				transaction,
			});
			resultSubSegment = parse(resultSubValue);
		}
		return { resultSegment, resultSubSegment };
	}
	async function generateDataItem(data: any, result, resultRotation) {
		const dataItem = {
			...data,
			segmentId: result?.resultSegment?.id ?? null,
			subSegmentId: result?.resultSubSegment?.id ?? null,
			rotationId: resultRotation?.id || null,
		};
		return dataItem;
	}

	// generate Login Data
	async function generateLoginData(dataItem) {
		const loginData = {
			email: dataItem.Email ?? null,
			firstName: dataItem.Forename ?? null,
			lastName: dataItem.Surname ?? null,
			birthDate: dataItem['Date de naissance'] ? numDate(dataItem['Date de naissance']) : null,
			placeOfBirth: dataItem['Lieu de naissance'] ?? null,
			gender: dataItem['M / F'] === 'M' ? 'male' : 'female',
			profileImage: dataItem['Profile Picture'] ?? null,
			phone: dataItem['Mobile Number'] ?? null,
		};
		return loginData;
	}

	async function generateBonusData(dataItem) {
		const bonusData = {
			bonus1: dataItem['Type de Bonus 1'] ?? '',
			bonusPrice1: dataItem['Bonus 1'] ?? '',
			bonusCoutJournalier1: dataItem['Bonus Cout Journalier 1'] ?? '',
			bonusEffectiveDate1: dataItem['Bonus Effective Date 1'] ?? '',
			bonus2: dataItem['Type de Bonus 2'] ?? '',
			bonusPrice2: dataItem['Bonus 2'] ?? '',
			bonusCoutJournalier2: dataItem['Bonus Cout Journalier 2'] ?? '',
			bonusEffectiveDate2: dataItem['Bonus Effective Date 2'] ?? '',
			bonus3: dataItem['Type de Bonus 3'] ?? '',
			bonusPrice3: dataItem['Bonus 3'] ?? '',
			bonusCoutJournalier3: dataItem['Bonus Cout Journalier 3'] ?? '',
			bonusEffectiveDate3: dataItem['Bonus Effective Date 3'] ?? '',
			bonus4: dataItem['Type de Bonus 4'] ?? '',
			bonusPrice4: dataItem['Bonus 4'] ?? '',
			bonusCoutJournalier4: dataItem['Bonus Cout Journalier 4'] ?? '',
			bonusEffectiveDate4: dataItem['Bonus Effective Date 4'] ?? '',
		};

		return bonusData;
	}

	// set Bonus Array Data
	async function bonusArray(bonusData: {}) {
		const bonusArrayValue = [];
		for (let i = 1; i <= 4; i++) {
			const bonus = bonusData[`bonus${i}`];
			const bonusPrice = bonusData[`bonusPrice${i}`];
			const bonusCoutJournalier = bonusData[`bonusCoutJournalier${i}`];
			const bonusEffectiveDate = bonusData[`bonusEffectiveDate${i}`];

			if (bonus !== '' || bonusPrice !== '' || bonusCoutJournalier !== '' || bonusEffectiveDate !== '') {
				bonusArrayValue.push({
					bonus,
					bonusPrice,
					bonusCoutJournalier,
					bonusEffectiveDate,
				});
			}
		}
		return bonusArrayValue;
	}

	// set Final Bonus Array Data
	async function finalData(bonusArrayData, transaction: Transaction) {
		const finalDataValue = [];
		for (const dataImportItem of bonusArrayData) {
			const bonusItem = await BonusType.findAll({
				attributes: ['id', 'code'],
				where: {
					code: dataImportItem.bonus,
				},
				transaction,
			});
			const parsedBonusItem = parse(bonusItem);
			parsedBonusItem.forEach((itemBonus) => {
				itemBonus.label = itemBonus.code;
				itemBonus.price = dataImportItem.bonusPrice;
				itemBonus.coutJournalier = dataImportItem.bonusCoutJournalier;
				itemBonus.bonusEffectiveDate = dataImportItem.bonusEffectiveDate;
				delete itemBonus.code;
			});
			finalDataValue.push(parsedBonusItem);
		}
		return finalDataValue;
	}
	async function generateValueOfData(clientId: number, data: any, dataItem, parsedFinalData, myFinalData) {
		const valueOfData = {
			employeeNumber: extractValue(dataItem, 'Matricule', ''),
			TempNumber: extractValue(dataItem, 'Temp No', null),
			contractNumber: extractValue(dataItem, 'Contract Number', null),
			startDate: parseDate(dataItem, 'Start Date'),
			fonction: dataItem.Fonction ?? null,
			nSS: extractValue(dataItem, 'N° S.S.', null),
			terminationDate: parseDate(dataItem, 'Termination Date'),
			baseSalary: extractNumber(dataItem, 'Salaire de Base'),
			travelAllowance: extractNumber(dataItem, 'Travel Allowance'),
			Housing: extractNumber(dataItem, 'Housing'),
			monthlySalary: extractNumber(dataItem, 'Monthly Salary'),
			overtime01Bonus: extractNumber(dataItem, 'Overtime Bonus 1'),
			overtime02Bonus: extractNumber(dataItem, 'Overtime Bonus 2'),
			customBonus: extractCustomBonus(parsedFinalData, myFinalData),
			contractSignedDate: parseDate(dataItem, 'CNAS Declaration Date'),
			weekendOvertimeBonus: extractNumber(dataItem, 'Weekend Overtime Bonus'),
			address: extractValue(dataItem, 'Address', null),
			medicalCheckDate: parseDate(dataItem, 'Medical Check Date'),
			medicalCheckExpiry: parseDate(dataItem, 'Medical Check Expiry'),
			medicalInsurance: extractBoolean(dataItem, 'Carte Chifa'),
			contractEndDate: parseDate(dataItem, 'Contract End Date'),
			LREDContractEndDate: parseDate(dataItem, 'LRED Contract End Date'),
			dailyCost: extractNumber(dataItem, 'Cout Journalier'),
			nextOfKinMobile: extractValue(dataItem, 'Next Of Kin Mobile', null),
			catalogueNumber: extractValue(dataItem, 'Catalogue Nº', null),
			nextOfKin: extractValue(dataItem, 'Next Of Kin', null),
			initialBalance: extractValue(dataItem, 'Initial Balance', null),
			photoVersionNumber: dataItem['Photo Version Number'] ?? null,
			clientId: clientId,
			segmentId: dataItem.segmentId,
			subSegmentId: dataItem.subSegmentId,
			rotationId: dataItem?.rotationId,
			email: dataItem.Email ?? null,
			slug: this.generateSlug(dataItem),
		};

		return valueOfData;
	}

	function extractValue(dataItem: any, key: string, defaultValue: any) {
		return dataItem[key] !== '' ? dataItem[key] : defaultValue;
	}

	function parseDate(dataItem: any, key: string) {
		return dataItem[key] ? numDate(dataItem[key]) : null;
	}

	function extractNumber(dataItem: any, key: string) {
		return dataItem[key] !== '' ? dataItem[key] : Number(0.0);
	}

	function extractBoolean(dataItem: any, key: string) {
		return dataItem[key] !== '' ? dataItem[key] === 'Y' : null;
	}

	function extractCustomBonus(parsedFinalData: any, finalDataItem: any) {
		return parsedFinalData && parsedFinalData.data.length > 0 ? finalDataItem : null;
	}

	// handle Employee Data
	async function handleEmployee(isExist: any, dataItem, valueOfData, loginData, user, transaction: Transaction) {
		const rollOver = dataItem.Rollover;
		const segmentDate = dataItem['Segment Date'] !== null ? numDate(dataItem['Segment Date']) : new Date();
		const salaryDate = dataItem['Salary Date'] !== null ? numDate(dataItem['Salary Date']) : new Date();
		const rotationDate = dataItem['Rotation Date'] !== null ? numDate(dataItem['Rotation Date']) : new Date();

		if (!isExist) {
			return await createEmployeeData(valueOfData, rollOver, loginData, user, transaction);
		} else {
			const combineData = { salaryDate, rotationDate, segmentDate };
			return await updateEmployeeData(
				isExist,
				{ combineData: combineData, data: valueOfData, loginData: loginData },
				rollOver,
				user,
				transaction,
			);
		}
	}

	async function createEmployeeData(
		item: any,
		rollOver: string,
		loginData: any,
		user: User,
		transaction: Transaction = null,
	) {
		try {
			const isExistEmail = await LoginUser.findOne({ where: { email: loginData.email, deletedAt: null }, transaction });
			if (isExistEmail) {
				throw new HttpException(400, 'Email Already Exist in this platform', {}, true);
			}
			const randomPassword = generateUniquePassword();
			let loginUserData =
				(await LoginUser.findOne({
					where: {
						uniqueLoginId: `${loginData.firstName}${loginData.LastName}${
							loginData.birthDate ? moment(loginData.birthDate).format('YYYYMMDD') : ''
						}`
							.replace(' ', '')
							.toLowerCase(),
						deletedAt: null,
					},
					transaction,
				})) || null;
			if (!loginUserData) {
				loginUserData = await LoginUser.create(
					{
						...loginData,
						name: loginData.firstName + ' ' + loginData.lastName,
						randomPassword: randomPassword,
						isMailNotification: false,
						uniqueLoginId: `${loginData.firstName}${loginData.lastName}${
							loginData.birthDate ? moment(loginData.birthDate).format('YYYYMMDD') : ''
						}`
							.replace(' ', '')
							.toLowerCase(),
					},
					{ transaction },
				);
			}
			let response = await Employee.create(
				{
					...item,
					startDate: moment(moment(item.startDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					loginUserId: loginUserData.id,
					createdBy: user.id,
				},
				{ transaction },
			);
			response = parse(response);

			const roleData = await Role.findOne({
				where: { name: 'Employee', deletedAt: null },
				include: [{ model: RolePermission, attributes: ['permissionId'] }],
				transaction,
			});
			if (roleData && loginUserData) {
				await User.create(
					{
						loginUserId: loginUserData.id,
						roleId: roleData.id,
						status: status.ACTIVE,
					},
					{ transaction },
				);
				roleData?.assignedPermissions?.map(async (permission: RolePermissionAttributes) => {
					await UserPermission.create(
						{
							permissionId: permission.permissionId,
							loginUserId: loginUserData.id,
							roleId: roleData.id,
							createdBy: user.id,
						},
						{ transaction },
					);
				});

				const replacement = {
					username: loginData.firstName + ' ' + loginData.lastName,
					useremail: loginData.email,
					password: randomPassword,
					logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
					url: FRONTEND_URL,
				};
				if (loginData.email) {
					// await sendMail([loginData.email,'admin@lred.com'], 'Credentials', 'userCredentials', replacement);
				}
			}

			let clientData = await Client.findOne({
				where: {
					id: item.clientId,
				},
				transaction,
			});
			clientData = parse(clientData);

			await Client.update(
				{
					...clientData,
					isResetBalance: rollOver === 'Y',
					updatedBy: user.id,
				},
				{ where: { id: item.clientId }, transaction },
			);
			if (item?.segmentId) {
				await EmployeeSegment.create(
					{
						employeeId: response.id,
						segmentId: item.segmentId,
						subSegmentId: item.subSegmentId ?? null,
						date: moment(moment(item.startDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						createdBy: user.id,
					},
					{ transaction },
				);
			}

			await EmployeeRotation.create(
				{
					employeeId: response.id,
					rotationId: response.rotationId || null,
					date: moment(moment(item.startDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				},
				{ transaction },
			);

			await this.timesheetController.createTimesheet(
				{
					clientId: item?.clientId,
					user: user,
					employeeIds: [+response.id],
					type: 'createAccount',
				},
				transaction,
			);
			await EmployeeSalary.create(
				{
					employeeId: response?.id,
					baseSalary: Number(item?.baseSalary.toFixed(2) ?? 0.0),
					monthlySalary: Number(item?.monthlySalary.toFixed(2) ?? 0.0),
					dailyCost: Number(item?.dailyCost.toFixed(2) ?? 0.0),
					startDate: item?.startDate ?? new Date(),
					endDate: null,
					createdBy: user?.id,
				},
				{ transaction },
			);
			return response?.id;
		} catch (error) {
			throw new Error(error);
		}
	}

	async function updateEmployeeData(
		isExistUser: any,
		employeeData: { combineData; data: any; loginData: any },
		rollOver: string,
		user: User,
		transaction: Transaction,
	) {
		const { data, combineData, loginData } = employeeData;
		const isExistEmail = await LoginUser.findOne({
			where: { email: data.email, id: { [Op.ne]: isExistUser.loginUserId }, deletedAt: null },
			transaction,
		});

		if (isExistEmail) {
			throw new HttpException(400, 'Email Already Exist in this platform', {}, true);
		}
		let clientData = await Client.findOne({
			where: {
				id: data.clientId,
			},
			transaction,
		});
		clientData = parse(clientData);
		await Client.update(
			{
				...clientData,
				isResetBalance: rollOver === 'Y',
				updatedBy: user.id,
			},
			{ where: { id: data.clientId }, transaction },
		);

		const lastExistSalary = await EmployeeSalary.findOne({
			where: { employeeId: isExistUser.id, deletedAt: null },
			order: [['id', 'desc']],
			transaction,
		});

		let updateEmployeeDataItem = {};
		if (
			lastExistSalary?.baseSalary != data?.baseSalary ||
			lastExistSalary?.monthlySalary != data?.monthlySalary ||
			lastExistSalary?.dailyCost != data?.dailyCost ||
			moment(lastExistSalary?.startDate).valueOf() != moment(combineData?.salaryDate ?? new Date()).valueOf()
		) {
			updateEmployeeDataItem = await handleEmployeeSalary(
				data,
				combineData,
				lastExistSalary,
				user,
				isExistUser,
				transaction,
			);
		}

		await Employee.update(
			{
				...data,
				startDate: moment(moment(data.startDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
				...updateEmployeeDataItem,
				updatedBy: user.id,
			},
			{
				where: {
					employeeNumber: isExistUser.employeeNumber,
					id: isExistUser.id,
				},
				transaction,
			},
		);
		if (isExistUser?.rotationId != data.rotationId) {
			await handleEmployeeRotation(isExistUser, combineData, data, user, transaction);
			await TimesheetSchedule.destroy({
				where: {
					date: {
						[Op.gte]: moment(
							moment(combineData.rotationDate ?? new Date()).format('DD-MM-YYYY'),
							'DD-MM-YYYY',
						).toDate(),
					},
					employeeId: isExistUser.id,
				},
				transaction,
			});
			this.timesheetController.createTimesheet(
				{
					clientId: isExistUser.clientId,
					user: user,
					employeeIds: [isExistUser.id],
					disableFunction: ['timesheetSummary'],
					type: 'createAccount',
				},
				transaction,
			);
		}
		// Segment And Sub-Segment Update
		if (isExistUser?.segmentId != data.segmentId || isExistUser?.subSegmentId !== data.subSegmentId) {
			await handleEmployeeSegment(isExistUser, combineData, data, user, transaction);
		}
		await LoginUser.update(
			{
				...loginData,
			},
			{ where: { id: isExistUser.loginUserId }, transaction },
		);
		let empData = await this.employeeRepo.getEmployeeByIdService(isExistUser.id);
		empData = parse(empData);

		await handleTimesheetOperations(isExistUser, empData, combineData, data, user, transaction);
	}

	// set salary data
	async function handleEmployeeSalary(
		data: any,
		combineData,
		lastExistSalary,
		user: User,
		isExistUser: any,
		transaction: Transaction,
	) {
		let updateEmployeeDataValue = {};

		await EmployeeSalary.update(
			{ endDate: moment(combineData?.salaryDate).add(-1, 'days'), updatedBy: user?.id },

			{ where: { id: lastExistSalary?.id }, transaction },
		);

		await EmployeeSalary.create(
			{
				baseSalary: Number(data?.baseSalary.toFixed(2) ?? 0.0),
				monthlySalary: Number(data?.monthlySalary.toFixed(2) ?? 0.0),
				dailyCost: Number(data?.dailyCost.toFixed(2) ?? 0.0),
				startDate: moment(combineData?.salaryDate ?? new Date()).toDate(),
				endDate: null,
				employeeId: isExistUser?.id,
				createdBy: user.id,
			},
			{ transaction },
		);

		updateEmployeeDataValue = {
			baseSalary: Number(data?.baseSalary.toFixed(2) ?? 0.0),
			monthlySalary: Number(data?.monthlySalary.toFixed(2) ?? 0.0),
			dailyCost: Number(data?.dailyCost.toFixed(2) ?? 0.0),
		};

		return updateEmployeeDataValue;
	}

	// set rotation data
	async function handleEmployeeRotation(
		isExistUser: any,
		combineData,
		data: any,
		user: User,
		transaction: Transaction,
	) {
		let existingRotation = await EmployeeRotation.findOne({
			where: {
				employeeId: isExistUser.id,

				date: moment(moment(combineData?.rotationDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
			},
			transaction,
		});
		existingRotation = parse(existingRotation);

		if (!existingRotation) {
			await EmployeeRotation.create(
				{
					employeeId: +isExistUser.id,
					rotationId: data.rotationId || null,
					date: moment(moment(combineData?.rotationDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				},
				{ transaction },
			);
		} else {
			await EmployeeRotation.update(
				{
					employeeId: isExistUser.id,
					rotationId: data.rotationId || null,
					date: moment(moment(combineData?.rotationDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				},
				{
					where: { employeeId: isExistUser.id, date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
					transaction,
				},
			);
		}
		return;
	}

	// set segment data
	async function handleEmployeeSegment(isExistUser: any, combineData, data: any, user: User, transaction: Transaction) {
		let existingSegment = await EmployeeSegment.findOne({
			where: {
				employeeId: isExistUser.id,
				date: moment(moment(combineData?.segmentDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
			},
			transaction,
		});

		existingSegment = parse(existingSegment);
		if (!existingSegment) {
			await EmployeeSegment.create(
				{
					employeeId: isExistUser.id,
					segmentId: data.segmentId || null,
					subSegmentId: data.subSegmentId || null,
					date: moment(moment(combineData?.segmentDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				},
				{ transaction },
			);
		} else {
			await EmployeeSegment.update(
				{
					employeeId: isExistUser.id,
					segmentId: data.segmentId || null,
					subSegmentId: data.subSegmentId || null,
					date: moment(moment(combineData?.segmentDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				},
				{
					where: {
						employeeId: isExistUser.id,
						date: moment(moment(combineData?.segmentDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					},
					transaction,
				},
			);
		}
		return;
	}

	// set timesheet data
	async function handleTimesheetOperations(
		isExistUser: any,
		empData,
		combineData,
		data: any,
		user: User,
		transaction: Transaction,
	) {
		if (
			String(moment(isExistUser?.startDate).format('DD-MM-YYYY')) !=
				String(moment(empData?.startDate).format('DD-MM-YYYY')) ||
			(empData.terminationDate &&
				String(moment(isExistUser?.terminationDate).format('DD-MM-YYYY')) !=
					String(moment(empData.terminationDate).format('DD-MM-YYYY')))
		) {
			if (
				String(moment(isExistUser?.startDate).format('DD-MM-YYYY')) !=
				String(moment(empData?.startDate).format('DD-MM-YYYY'))
			) {
				await this.timesheetRepo.clearEmployeeTimesheetByEmployeeId(empData.id);
			}

			this.timesheetController.createTimesheet(
				{
					clientId: data.clientId,
					user: user.id,
					employeeIds: [empData.id],
					type: 'createAccount',
				},
				transaction,
			);
		}

		if (isExistUser?.segmentId != empData?.segmentId || isExistUser?.subSegmentId != empData?.subSegmentId) {
			const currentDate = moment(
				moment(combineData?.segmentDate ?? new Date()).format('DD-MM-YYYY'),
				'DD-MM-YYYY',
			).toDate();

			await Timesheet.update(
				{ segmentId: empData?.segmentId, subSegmentId: empData?.subSegmentId },
				{ where: { deletedAt: null, startDate: { [Op.gte]: currentDate }, employeeId: empData.id }, transaction },
			);
		}

		if (isExistUser?.rotationId != empData.rotationId) {
			this.timesheetController.createTimesheet(
				{
					clientId: data.clientId,
					user: user.id,
					employeeIds: [empData.id],
					disableFunction: ['timesheetSummary'],
					type: 'createAccount',
				},
				transaction,
			);
		}
		return;
	}
})()
	.then(async () => {
		console.log('info', 'User Added Successfully...');
	})
	.catch((err) => {
		console.log('info', err.message);
	});
