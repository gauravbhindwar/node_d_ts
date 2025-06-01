import { medicalRequestStatus } from '@/interfaces/model/medicalRequest.interface';
import db from '@/models';
import AccountPO from '@/models/accountPO.model';
import BonusType from '@/models/bonusType.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeBonus from '@/models/employeeBonus.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
import MedicalRequest from '@/models/medicalRequest.model';
import MedicalType from '@/models/medicalType.model';
import ReliquatAdjustment from '@/models/reliquatAdjustment.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import ReliquatPayment from '@/models/reliquatPayment.model';
import Rotation from '@/models/rotation.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import User from '@/models/user.model';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import TimesheetRepo from '@/repository/timesheet.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op, Transaction } from 'sequelize';

const timesheetRepo = new TimesheetRepo();
const reliquatCalculationRepo = new ReliquatCalculationRepo();

async function generateAccountPO(
	data: {
		timesheetId: number;
		startDate: Date;
		endDate: Date;
		segmentId: number;
		subSegmentId: number;
	},
	transaction: Transaction = null,
) {
	try {
		const momentStartDate = moment(data.startDate).toDate();
		const momentEndDate = moment(data.endDate).toDate();
		const segmentStartDate = moment(data.startDate).add(1, 'month').toDate();
		const segmentEndDate = moment(data.endDate).add(1, 'month').toDate();
		const serviceMonth = moment(data?.startDate).format('MMM');
		const serviceYear = moment(data?.startDate).format('YY');
		let timesheetData = await Timesheet.findAll({
			where: {
				id: data.timesheetId,
				deletedAt: null,
				status: 'APPROVED',
			},
			attributes: ['id', 'oldTimesheetId', 'approvedBy'],
			include: [
				{
					model: Employee,
					attributes: [
						'id',
						'employeeNumber',
						'fonction',
						'customBonus',
						'dailyCost',
						'oldEmployeeId',
						'terminationDate',
					],
					required: true,
					include: [
						{
							model: TimesheetSchedule,
							attributes: ['employeeId', 'status', 'date', 'overtimeHours', 'bonusCode'],
							where: {
								date: {
									[Op.between]: [momentStartDate, momentEndDate],
								},
							},
							required: true,
						},
						{
							model: EmployeeRotation,
							separate: true,
							attributes: ['rotationId'],
							include: [
								{
									model: Rotation,
									attributes: ['isResident', 'name', 'weekOn', 'weekOff'],
								},
							],
						},
						{
							model: ReliquatCalculation,
							attributes: ['reliquat', 'presentDay', 'leave', 'overtime'],
							required: false,
						},
						{
							model: ReliquatPayment,
							where: {
								startDate: {
									[Op.gte]: momentStartDate,
									[Op.lte]: momentEndDate,
								},
							},
							required: false,
							attributes: ['id', 'amount', 'startDate'],
						},
						{
							model: ReliquatAdjustment,
							where: {
								startDate: momentStartDate,
							},
							required: false,
							attributes: ['id', 'adjustment'],
						},
						{
							model: EmployeeSegment,
							where: {
								date: {
									[Op.gte]: segmentStartDate,
									[Op.lte]: segmentEndDate,
								},
							},
							required: false,
							attributes: ['id', 'rollover', 'date'],
						},
						{
							model: EmployeeBonus,
							required: false,
							where: {
								startDate: {
									[Op.lte]: momentEndDate,
								},
								endDate: {
									[Op.or]: {
										[Op.eq]: null,
										[Op.gt]: momentStartDate,
									},
								},
							},
							include: [
								{
									model: BonusType,
									attributes: ['id', 'name', 'code', 'timesheetName'],
								},
							],
						},
						{
							model: EmployeeSalary,
							required: false,
							where: {
								startDate: {
									[Op.lte]: momentEndDate,
								},
								endDate: {
									[Op.or]: {
										[Op.eq]: null,
										[Op.gte]: momentStartDate,
									},
								},
							},
							attributes: ['id', 'monthlySalary', 'dailyCost', 'endDate', 'startDate'],
						},
					],
				},
				{
					model: Client,
					attributes: ['code', 'id'],
				},
			],
			order: [
				['employee', 'employeeSegment', 'date', 'desc'],
				['employee', 'employeeBonus', 'startDate', 'desc'],
			],
			transaction,
		});
		let managerName = null;
		if (timesheetData[0]?.approvedBy) {
			let managerNameData = await User.findOne({
				where: {
					id: timesheetData[0]?.approvedBy,
				},
				attributes: [],
				include: [
					{
						model: LoginUser,
						attributes: ['name', 'firstName', 'lastName'],
					},
				],
				transaction,
			});
			managerNameData = parse(managerNameData);
			managerName = managerNameData?.loginUserData?.name
				? managerNameData?.loginUserData?.name
				: `${managerNameData?.loginUserData?.lastName}+" "+${managerNameData?.loginUserData?.firstName}`;
		}
		timesheetData = parse(timesheetData);
		if (timesheetData?.length > 0) {
			// const poNumberData = await mssqldb.query(
			// 	`SELECT PONumber FROM rd_TimesheetEmployee WHERE TimesheetId='${timesheetData[0].oldTimesheetId}' AND EmployeeId='${timesheetData[0]?.employee?.oldEmployeeId}' AND PONumber IS NOT NULL AND PONumber !=''`,
			// );
			const poNumber = 'PO' + String(data.timesheetId) + String(Math.floor(1000 + Math.random() * 9000));
			// if (poNumberData[0].length > 0 && poNumberData[0][0]['PONumber']) {
			// 	poNumber = poNumberData[0][0]['PONumber'];
			// }
			let customBonus = timesheetData?.[0].employee?.employeeBonus;
			const filterBonus = new Map();
			for (const employeeBonusData of customBonus) {
				const isExist = filterBonus.get(
					`${employeeBonusData?.bonus?.code}-${employeeBonusData?.price ?? 0}-${
						employeeBonusData?.coutJournalier ?? 0
					}`,
				);
				if (!isExist) {
					filterBonus.set(
						`${employeeBonusData?.bonus?.code}-${employeeBonusData?.price ?? 0}-${
							employeeBonusData?.coutJournalier ?? 0
						}`,
						employeeBonusData,
					);
				}
			}
			customBonus = [...filterBonus.values()];
			const empSalary = timesheetData?.[0].employee?.employeeSalary;
			// if (customBonus?.data) {
			// 	customBonus = customBonus?.data;
			// }
			const bonusData = await BonusType.findAll({
				where: {
					// isActive: true,
					deletedAt: null,
				},
				transaction,
			});
			let medicalTypeData = await MedicalType.findAll({
				where: {
					deletedAt: null,
				},
				transaction,
			});
			medicalTypeData = parse(medicalTypeData);

			let medicalData = await MedicalRequest.findAll({
				where: {
					status: medicalRequestStatus.ACTIVE,
					employeeId: timesheetData[0]?.employee?.id,
					medicalDate: {
						[Op.between]: [momentStartDate, momentEndDate],
					},
				},
				include: [
					{
						model: Employee,
						attributes: ['clientId'],
						where: {
							clientId: timesheetData[0]?.client?.id,
						},
					},
					{
						model: MedicalType,
						attributes: ['id', 'name', 'amount'],
					},
					{
						model: User,
						as: 'createdByUser',
						attributes: ['id', 'loginUserId'],
						include: [{ model: LoginUser, attributes: ['firstName', 'name', 'lastName', 'email'] }],
					},
				],
			});
			medicalData = parse(medicalData);

			const bonusArr = [];
			const salaryArr = [];
			const medicalArr = [];
			const hourlyOvertimeBonus = [
				'P,DAILY',
				'P,NIGHT',
				'P,HOLIDAY',
				'CHB,DAILY',
				'CHB,NIGHT',
				'CHB,WEEKEND',
				'CHB,HOLIDAY',
				'W,WEEKEND',
				'W,NIGHT',
			];

			medicalTypeData?.forEach((medicalTypeValue) => {
				if (medicalData.some((element) => element?.medicalTypeData?.name === medicalTypeValue.name)) {
					const isExist = medicalData.filter((medicalType) => {
						return medicalTypeValue.name === medicalType?.medicalTypeData?.name;
					});

					if (isExist?.length > 0) {
						const medicalItem = isExist ? Object.assign({}, ...isExist) : null;

						medicalArr.push({
							label: medicalTypeValue?.name,
							count: isExist?.length || 0,
							price: Number(medicalTypeValue?.amount)?.toFixed(2) ?? 0,
							medicalDate: medicalItem?.medicalDate,
							manager: medicalItem?.createdByUser?.loginUserData?.name
								? medicalItem?.createdByUser?.loginUserData?.name
								: medicalItem?.createdByUser?.loginUserData?.firstName +
								  ' ' +
								  medicalItem?.createdByUser?.loginUserData?.lastName,
						});
					}
				}
			});

			bonusData?.forEach((bonus) => {
				if (
					timesheetData[0].employee?.timeSheetSchedule.some(
						(element) => element?.bonusCode?.split(',')?.indexOf(bonus?.code) >= 0,
					)
				) {
					const isExist = timesheetData[0].employee?.timeSheetSchedule.filter((bonusType) => {
						return bonusType?.bonusCode?.split(',')?.indexOf(bonus?.code) >= 0;
					});
					if (isExist?.length > 0) {
						if (customBonus && customBonus?.length > 0) {
							const isExistingCustomBonus = customBonus?.findIndex(
								(customBonusIndex) => customBonusIndex?.bonus?.code === bonus?.code,
							);
							if (isExistingCustomBonus >= 0) {
								const filteredCustomBonus = customBonus?.filter((e) => e?.bonus?.code === bonus?.code);
								filteredCustomBonus.forEach((bonusValue, index) => {
									let startDate;
									if (filteredCustomBonus?.length - 1 === index) {
										startDate = momentStartDate;
									} else {
										startDate = moment(bonusValue.startDate);
									}
									const endDate = moment(
										bonusValue?.endDate ? moment(bonusValue.endDate).subtract(1, 'days') : momentEndDate,
									);
									const items = [];
									isExist.forEach((itemValue) => {
										const itemDate = moment(itemValue.date);
										if (itemDate.isBetween(startDate, endDate, null, '[]')) {
											items.push(itemValue);
										}
									});

									bonusArr.push({
										label: bonusValue.bonus?.name,
										count: items?.length || 0,
										price: Number(bonusValue?.coutJournalier)?.toFixed(2) ?? 0,
										startDate,
										endDate,
									});
								});
							} else {
								bonusArr.push({
									label: bonus.name,
									count: isExist?.length || 0,
									price: Number(bonus.basePrice.toFixed(2)),
								});
							}
						} else {
							bonusArr.push({
								label: bonus.name,
								count: isExist?.length,
								price: Number(bonus.basePrice.toFixed(2)),
							});
						}
					}
				}
			});

			// Salary Data.....

			if (empSalary && empSalary?.length > 0) {
				empSalary.forEach((salaryValue, index) => {
					let startDate;
					if (empSalary?.length - 1 === index) {
						startDate = momentStartDate;
					} else {
						startDate = moment(salaryValue.startDate);
					}
					const endDate = moment(salaryValue.endDate ?? momentEndDate);
					const presentSalaryDays = timesheetData[0]?.employee?.timeSheetSchedule?.filter((itemValue) => {
						const itemDate = moment(itemValue.date);
						return (
							itemDate.isBetween(startDate, endDate, null, '[]') &&
							(itemValue?.status === 'P' ||
								itemValue?.status === 'CR' ||
								itemValue.status === 'CHB' ||
								itemValue?.status === 'TR' ||
								itemValue?.status === 'AP' ||
								itemValue?.status === 'CA')
						);
					});
					salaryArr.push({
						dailyCost: Number(salaryValue?.dailyCost)?.toFixed(2) ?? 0,
						startDate,
						count: presentSalaryDays?.length || 0,
						endDate,
					});
				});
			}

			// End Salary Data.....

			let hourlyBonusPrice = 0;
			const respData = new Map();
			for (const timesheetDataFilter of timesheetData[0].employee?.timeSheetSchedule) {
				let length = 0;
				if (hourlyOvertimeBonus.includes(`${timesheetDataFilter?.status},${timesheetDataFilter?.bonusCode}`)) {
					length = 1;
					const prevValue = respData.get(`${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`);
					if (prevValue) {
						length = prevValue?.length + 1;
					}
					respData.set(`${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`, {
						...timesheetDataFilter,
						length: length,
					});
				}
			}
			const hourlyBonusArr = [];
			for (const hourlyBonusData of respData.values()) {
				hourlyBonusArr.push(hourlyBonusData);
			}

			const clientCode = timesheetData[0]?.client?.code;
			let invoiceNo = `${Math.floor(
				Math.random() * 100000,
			)}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
			const hourlyBonusInvoiceNumber = `${Math.floor(
				Math.random() * 100000,
			)}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
			const hourlyBonusPONumber = 'PO' + String(data.timesheetId) + String(Math.floor(1000 + Math.random() * 9000));
			const medicalPONumber = 'PO' + String(data.timesheetId) + String(Math.floor(1000 + Math.random() * 9000));

			// const employeeSalary = await EmployeeSalary.findOne({
			// 	where: {
			// 		employeeId: timesheetData[0].employee?.id,
			// 		startDate: {
			// 			[Op.lte]: data.endDate,
			// 		},
			// 	},
			// 	order: [['startDate', 'desc']],
			// 	transaction,
			// });
			// const employeeDailyCost = employeeSalary
			// 	? employeeSalary.dailyCost
			// 	: timesheetData[0].employee?.dailyCost
			// 	? Number(timesheetData[0].employee?.dailyCost.toFixed(2))
			// 	: 0;

			if (timesheetData[0]?.employee?.employeeRotation?.[0]?.rotation?.name !== 'Call Out') {
				let reliquatValue: number;
				let finalTotal;
				// const status = timesheetData[0].employee?.timeSheetSchedule.filter((presentDays) => {
				// 	return (
				// 		presentDays.status === 'P' ||
				// 		presentDays.status === 'CR' ||
				// 		presentDays?.status === 'TR' ||
				// 		presentDays?.status === 'AP' ||
				// 		presentDays?.status === 'CA'
				// 		// 	 &&
				// 		// presentDays?.bonusCode !== 'W' &&
				// 		// presentDays?.bonusCode !== 'O1' &&
				// 		// presentDays?.bonusCode !== 'O2'
				// 	);
				// });
				// const totalPresentDays = status?.length || 0;
				// const reliquatAdjustment = 0;
				// let reliquatPayment = 0;

				// if (
				// 	moment(timesheetData[0]?.employee?.terminationDate).isBetween(momentStartDate, momentEndDate) ||
				// 	moment(timesheetData[0]?.employee?.terminationDate).isSame(momentStartDate) ||
				// 	moment(timesheetData[0]?.employee?.terminationDate).isSame(momentEndDate)
				// ) {
				// 	const reliquatCalculation = timesheetData[0]?.employee?.reliquatCalculation?.[0]?.reliquat;
				// 	reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
				// } else if (
				// 	timesheetData[0]?.employee?.employeeSegment?.length > 0 &&
				// 	!timesheetData[0]?.employee?.employeeSegment[0]?.rollover
				// ) {
				// 	const reliquatCalculation = await reliquatCalculationRepo.generateReliquatCalculationService(
				// 		{
				// 			employeeId: String(timesheetData[0]?.employee?.id),
				// 			date: moment(
				// 				moment(timesheetData[0]?.employee?.employeeSegment?.[0]?.date).subtract(1, 'day').format('DD-MM-YYYY'),
				// 				'DD-MM-YYYY',
				// 			).toDate(),
				// 		},
				// 		transaction,
				// 	);
				// 	reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
				// } else {
				// 	reliquatValue = 0;
				// }
				// timesheetData[0]?.employee?.reliquatPayment?.map((paymentData) => {
				// 	reliquatPayment += paymentData?.amount ?? 0;
				// });

				// timesheetData[0]?.employee?.reliquatAdjustment?.map((adjustmentData) => {
				// 	reliquatAdjustment += adjustmentData?.adjustment ?? 0;
				// });

				// const finalTotal = totalPresentDays + reliquatAdjustment + reliquatPayment + reliquatValue;

				for (const element of salaryArr) {
					if (
						moment(timesheetData[0]?.employee?.terminationDate).isBetween(
							element?.startDate ?? momentStartDate,
							element?.endDate ?? momentEndDate,
						) ||
						moment(timesheetData[0]?.employee?.terminationDate).isSame(element?.startDate ?? momentStartDate) ||
						moment(timesheetData[0]?.employee?.terminationDate).isSame(element?.endDate ?? momentEndDate)
					) {
						const reliquatCalculation = timesheetData[0]?.employee?.reliquatCalculation?.[0]?.reliquat;
						reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
					} else if (
						moment(timesheetData[0]?.employee?.employeeSegment[0]?.date).isSameOrBefore(
							element?.startDate ?? momentStartDate,
						) &&
						moment(timesheetData[0]?.employee?.employeeSegment[0]?.date).isSameOrAfter(
							element?.endDate ?? momentEndDate,
						) &&
						timesheetData[0]?.employee?.employeeSegment?.length > 0 &&
						!timesheetData[0]?.employee?.employeeSegment[0]?.rollover
					) {
						const findEmpIndex = timesheetData[0]?.employee?.employeeSegment.findIndex(
							(ele) =>
								moment(ele.date).isSameOrAfter(element?.startDate ?? momentStartDate) &&
								moment(ele.date).isSameOrBefore(element?.endDate ?? momentEndDate),
						);

						const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
							employeeId: String(timesheetData[0]?.employee?.id),
							date: moment(
								moment(timesheetData[0]?.employee?.employeeSegment[findEmpIndex]?.date)
									.subtract(1, 'day')
									.format('DD-MM-YYYY'),
								'DD-MM-YYYY',
							).toDate(),
						});
						reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
					} else {
						reliquatValue = 0;
					}

					const paymentValueData = timesheetData[0]?.employee?.reliquatPayment?.find(
						(paymentData) =>
							moment(paymentData.startDate).isSameOrAfter(element?.startDate ?? momentStartDate) &&
							moment(paymentData.startDate).isSameOrBefore(element?.endDate ?? momentEndDate),
					);

					if (paymentValueData) {
						finalTotal = element?.count + Number(paymentValueData?.amount) ?? 0 + reliquatValue;
					} else {
						finalTotal = element?.count + reliquatValue;
					}
					await AccountPO.create(
						{
							timesheetId: data.timesheetId,
							type: 'Salary',
							poNumber: poNumber,
							dailyRate: element.dailyCost ? Number(element.dailyCost) : 0,
							timesheetQty: finalTotal,
							startDate: element?.startDate ?? momentStartDate,
							endDate: element?.endDate ?? momentEndDate,
							segmentId: data?.segmentId ?? null,
							subSegmentId: data?.subSegmentId ?? null,
							invoiceNo: invoiceNo,
							managers: managerName,
						},
						{ transaction },
					);
				}
			}
			for (const element of bonusArr) {
				invoiceNo = `${Math.floor(
					Math.random() * 100000,
				)}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
				await AccountPO.create(
					{
						timesheetId: data.timesheetId,
						type: element.label,
						poNumber: poNumber,
						dailyRate: element.price,
						timesheetQty: element.count,
						startDate: element?.startDate ?? momentStartDate,
						endDate: element?.endDate ?? momentEndDate,
						segmentId: data?.segmentId ?? null,
						subSegmentId: data?.subSegmentId ?? null,
						invoiceNo: invoiceNo,
						managers: managerName,
					},
					{ transaction },
				);
			}

			for (const e of hourlyBonusArr) {
				const dailyRateMultipliedBy =
					e.bonusCode === 'NIGHT' || e.bonusCode === 'WEEKEND' || e.bonusCode === 'HOLIDAY'
						? 2
						: e.bonusCode === 'DAILY' && e?.overtimeHours < 4
						? 1.5
						: e.bonusCode === 'DAILY' && e?.overtimeHours > 4
						? 1.75
						: 1;
				hourlyBonusPrice = (timesheetData[0].employee?.dailyCost / 8) * e.overtimeHours * dailyRateMultipliedBy;
				await AccountPO.create(
					{
						timesheetId: data.timesheetId,
						type: `${e.status},${e.bonusCode}`,
						poNumber: hourlyBonusPONumber,
						dailyRate: hourlyBonusPrice,
						timesheetQty: e?.length || 0,
						startDate: momentStartDate,
						endDate: momentEndDate,
						segmentId: data?.segmentId ?? null,
						subSegmentId: data?.subSegmentId ?? null,
						invoiceNo: hourlyBonusInvoiceNumber,
						managers: managerName,
					},
					{ transaction },
				);
			}

			for (const element of medicalArr) {
				const serviceMedicalMonth = moment(element?.medicalDate).format('MMM');
				const serviceMedicalYear = moment(element?.medicalDate).format('YY');

				invoiceNo = `${Math.floor(
					Math.random() * 100000,
				)}/${serviceMedicalMonth.toLocaleUpperCase()}${serviceMedicalYear}/${clientCode}`;
				await AccountPO.create(
					{
						timesheetId: data.timesheetId,
						type: 'Medical',
						poNumber: medicalPONumber,
						dailyRate: element?.price ? Number(element?.price) : 0,
						timesheetQty: element?.count ?? 1,
						startDate: momentStartDate,
						endDate: momentEndDate,
						segmentId: data?.segmentId ?? null,
						subSegmentId: data?.subSegmentId ?? null,
						invoiceNo: invoiceNo,
						managers: element?.manager,
					},
					{ transaction },
				);
			}
		}
		return;
	} catch (error) {
		throw new Error(error);
	}
}

(async function injectAccountPOs() {
	const result = await Timesheet.findAll({
		where: { status: 'APPROVED', deletedAt: null },
		include: [
			{
				model: Employee,
				attributes: ['id'],
				// where: {
				// 	oldEmployeeId: { [Op.not]: null },
				// },
				include: [
					{
						model: LoginUser,
						attributes: ['firstName', 'lastName'],
					},
				],
			},
		],
		order: [['startDate', 'DESC']],
	});
	console.log('info', '------------------------- Start Account POs Migration -------------------------');
	if (result.length) {
		for (const data of result) {
			const transaction = await db.transaction();
			const startTime = process.hrtime();
			try {
				const timesheetSummary = await timesheetRepo.getTimesheetByIdService(data.id, transaction);
				if (timesheetSummary) {
					await AccountPO.destroy({
						where: {
							timesheetId: data.id,
						},
						force: true,
						transaction,
					});
					let startDate = moment(data.startDate).toDate();
					let endDate = moment(data.endDate).toDate();
					const employeeSegmentWiseData = await EmployeeSegment.findAll({
						where: {
							employeeId: data.employee.id,
							deletedAt: null,
							date: {
								[Op.or]: {
									[Op.between]: [startDate, endDate],
									[Op.eq]: startDate,
									[Op.eq]: endDate,
								},
							},
						},
						attributes: ['id', 'date', 'segmentId', 'subSegmentId'],
						transaction,
					});
					if (employeeSegmentWiseData.length > 0) {
						for (const employeeSegment of employeeSegmentWiseData) {
							if (employeeSegment.segmentId !== data.segmentId && employeeSegment.subSegmentId !== data.subSegmentId) {
								endDate = moment(employeeSegment.date).toDate();
								await generateAccountPO(
									{
										timesheetId: data.id,
										startDate: startDate,
										endDate: endDate,
										segmentId: employeeSegment.segmentId,
										subSegmentId: employeeSegment.subSegmentId,
									},
									transaction,
								);
								startDate = moment(employeeSegment.date).add(1, 'days').toDate();
							}
						}
						endDate = moment(data.endDate).toDate();
					}
					await generateAccountPO(
						{
							timesheetId: data.id,
							startDate: startDate,
							endDate: endDate,
							segmentId: data.segmentId,
							subSegmentId: data.subSegmentId,
						},
						transaction,
					);
				}
				await transaction.commit();
				const endTime = process.hrtime(startTime);
				const elapsedTime = endTime[0] * 1000 + endTime[1] / 1e6;
			} catch (error) {
				console.log('ERROR', error);
				await transaction.rollback();
			}
		}
	}
	console.log('info', '-------------------------End Account POs Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
