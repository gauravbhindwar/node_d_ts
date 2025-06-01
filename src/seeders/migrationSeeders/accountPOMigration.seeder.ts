import AccountPO from '@/models/accountPO.model';
import BonusType from '@/models/bonusType.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
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
import { Op } from 'sequelize';

const timesheetRepo = new TimesheetRepo();
const reliquatCalculationRepo = new ReliquatCalculationRepo();

async function generateAccountPO(data: {
	timesheetId: number;
	startDate: Date;
	endDate: Date;
	segmentId: number;
	subSegmentId: number;
}) {
	try {
		const momentStartDate = moment(data.startDate).toDate();
		const momentEndDate = moment(data.endDate).toDate();
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
							attributes: ['id', 'amount'],
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
									[Op.gte]: momentStartDate,
									[Op.lte]: momentEndDate,
								},
							},
							required: false,
							attributes: ['id', 'rollover', 'date'],
						},
					],
				},
				{
					model: Client,
					attributes: ['code'],
				},
			],
			order: [['employee', 'employeeSegment', 'date', 'desc']],
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
			let customBonus = JSON.parse(timesheetData[0].employee?.customBonus);
			if (customBonus?.data) {
				customBonus = customBonus?.data;
			}
			const bonusData = await BonusType.findAll({
				where: {
					// isActive: true,
					deletedAt: null,
				},
			});
			const bonusArr = [];
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
			bonusData?.forEach((bonus) => {
				if (timesheetData[0].employee?.timeSheetSchedule.some((element) => element.bonusCode === bonus.code)) {
					const isExist = timesheetData[0].employee?.timeSheetSchedule.filter((bonusType) => {
						return bonus.code === bonusType.bonusCode;
					});
					if (isExist?.length > 0) {
						if (customBonus && Object.keys(customBonus)?.length > 0) {
							const isExistingCustomBonus = customBonus?.findIndex(
								(customBonusIndex) => customBonusIndex?.label === bonus?.code,
							);
							if (isExistingCustomBonus >= 0) {
								bonusArr.push({
									label: bonus.timesheetName,
									count: isExist?.length || 0,
									price: Number(customBonus[isExistingCustomBonus]?.coutJournalier)?.toFixed(2) ?? 0,
								});
							} else {
								bonusArr.push({
									label: bonus.timesheetName,
									count: isExist?.length || 0,
									price: Number(bonus.basePrice.toFixed(2)),
								});
							}
						} else {
							bonusArr.push({
								label: bonus.timesheetName,
								count: isExist?.length,
								price: Number(bonus.basePrice.toFixed(2)),
							});
						}
					}
				}
			});

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

			const employeeSalary = await EmployeeSalary.findOne({
				where: {
					employeeId: timesheetData[0].employee?.id,
					startDate: {
						[Op.lte]: data.endDate,
					},
				},
				order: [['startDate', 'desc']],
			});
			const employeeDailyCost = employeeSalary
				? employeeSalary.dailyCost
				: timesheetData[0].employee?.dailyCost
				? Number(timesheetData[0].employee?.dailyCost.toFixed(2))
				: 0;

			if (timesheetData[0]?.employee?.employeeRotation?.[0]?.rotation?.name !== 'Call Out') {
				const status = timesheetData[0].employee?.timeSheetSchedule.filter((presentDays) => {
					return (
						presentDays.status === 'P' ||
						presentDays.status === 'CR' ||
						presentDays?.status === 'TR' ||
						presentDays?.status === 'AP' ||
						presentDays?.status === 'CA'
						// 	&&
						// presentDays?.bonusCode !== 'W' &&
						// presentDays?.bonusCode !== 'O1' &&
						// presentDays?.bonusCode !== 'O2'
					);
				});
				const totalPresentDays = status?.length || 0;
				// let reliquatAdjustment = 0;
				let reliquatPayment = 0;
				let reliquatValue: number;
				if (
					moment(timesheetData[0]?.employee?.terminationDate).isBetween(momentStartDate, momentEndDate) ||
					moment(timesheetData[0]?.employee?.terminationDate).isSame(momentStartDate) ||
					moment(timesheetData[0]?.employee?.terminationDate).isSame(momentEndDate)
				) {
					const reliquatCalculation = timesheetData[0]?.employee?.reliquatCalculation?.[0]?.reliquat;
					reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
				} else if (
					timesheetData[0]?.employee?.employeeSegment?.length > 0 &&
					!timesheetData[0]?.employee?.employeeSegment[0]?.rollover
				) {
					const reliquatCalculation = await reliquatCalculationRepo.generateReliquatCalculationService({
						employeeId: String(timesheetData[0]?.employee?.id),
						date: moment(
							moment(timesheetData[0]?.employee?.employeeSegment?.[0]?.date).subtract(1, 'day').format('DD-MM-YYYY'),
							'DD-MM-YYYY',
						).toDate(),
					});
					reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
				} else {
					reliquatValue = 0;
				}
				timesheetData[0]?.employee?.reliquatPayment?.map((paymentData) => {
					reliquatPayment += paymentData?.amount ?? 0;
				});

				// timesheetData[0]?.employee?.reliquatAdjustment?.map((adjustmentData) => {
				// 	reliquatAdjustment += adjustmentData?.adjustment ?? 0;
				// });

				const finalTotal = totalPresentDays + reliquatPayment + reliquatValue;
				// const finalTotal = totalPresentDays + reliquatAdjustment + reliquatPayment + reliquatValue;

				await AccountPO.create({
					timesheetId: data.timesheetId,
					type: 'Salary',
					poNumber: poNumber,
					dailyRate: employeeDailyCost,
					timesheetQty: finalTotal,
					startDate: momentStartDate,
					endDate: momentEndDate,
					segmentId: data?.segmentId ?? null,
					subSegmentId: data?.subSegmentId ?? null,
					invoiceNo: invoiceNo,
					managers: managerName,
				});
			}
			bonusArr.forEach((element) => {
				invoiceNo = `${Math.floor(
					Math.random() * 100000,
				)}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
				AccountPO.create({
					timesheetId: data.timesheetId,
					type: element.label,
					poNumber: poNumber,
					dailyRate: element.price,
					timesheetQty: element.count,
					startDate: momentStartDate,
					endDate: momentEndDate,
					segmentId: data?.segmentId ?? null,
					subSegmentId: data?.subSegmentId ?? null,
					invoiceNo: invoiceNo,
					managers: managerName,
				});
			});

			hourlyBonusArr.forEach((e) => {
				const dailyRateMultipliedBy =
					e.bonusCode?.endsWith(',NIGHT') || e.bonusCode?.endsWith(',WEEKEND') || e.bonusCode?.endsWith(',HOLIDAY')
						? 2
						: e.bonusCode?.endsWith(',DAILY') && e?.overtimeHours < 4
						? 1.5
						: e.bonusCode?.endsWith(',DAILY') && e?.overtimeHours > 4
						? 1.75
						: 1;
				hourlyBonusPrice = (timesheetData[0].employee?.dailyCost / 8) * e.overtimeHours * dailyRateMultipliedBy;
				AccountPO.create({
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
				});
			});
		}
	} catch (error) {
		console.log('ERROR', error);
	}
}

(async function injectAccountPOs() {
	const result = await Timesheet.findAll({
		where: { status: 'APPROVED', deletedAt: null },
		include: [
			{
				model: Employee,
				attributes: ['id'],
				where: {
					oldEmployeeId: { [Op.not]: null },
				},
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
			try {
				const timesheetSummary = await timesheetRepo.getTimesheetByIdService(data.id, null);
				if (timesheetSummary) {
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
					});
					if (employeeSegmentWiseData.length > 0) {
						for (const employeeSegment of employeeSegmentWiseData) {
							if (employeeSegment.segmentId !== data.segmentId && employeeSegment.subSegmentId !== data.subSegmentId) {
								endDate = moment(employeeSegment.date).toDate();
								await generateAccountPO({
									timesheetId: data.id,
									startDate: startDate,
									endDate: endDate,
									segmentId: employeeSegment.segmentId,
									subSegmentId: employeeSegment.subSegmentId,
								});
								startDate = moment(employeeSegment.date).add(1, 'days').toDate();
							}
						}
						endDate = moment(data.endDate).toDate();
					}

					await generateAccountPO({
						timesheetId: data.id,
						startDate: startDate,
						endDate: endDate,
						segmentId: data.segmentId,
						subSegmentId: data.subSegmentId,
					});
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Account POs Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
