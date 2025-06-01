import { BonusOptions, activeTabForTimesheetSchedule } from '@/constants/common.constants';
import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { DefaultRoles } from '@/interfaces/functional/feature.interface';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { EmployeeAttributes } from '@/interfaces/model/employee.interface';
import { TimesheetAttributes } from '@/interfaces/model/timesheet.interface';
import { TimesheetScheduleAttributes } from '@/interfaces/model/timesheetSchedule.interface';
import BonusType from '@/models/bonusType.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeBonus from '@/models/employeeBonus.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
import ReliquatAdjustment from '@/models/reliquatAdjustment.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import ReliquatPayment from '@/models/reliquatPayment.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import User from '@/models/user.model';
import { getSegmentAccessForUser, getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import moment from 'moment';
import { Op, Sequelize, Transaction } from 'sequelize';
import BaseRepository from './base.repository';
import BonusTypeRepo from './bonusType.repository';
import ReliquatCalculationRepo from './reliquatCalculation.repository';

export default class TimesheetScheduleRepo extends BaseRepository<TimesheetSchedule> {
	constructor() {
		super(TimesheetSchedule.name);
	}

	private reliquatCalculationRepo = new ReliquatCalculationRepo();

	private dateFormat = 'DD-MM-YYYY';
	private attributes = [
		'firstName',
		'lastName',
		'gender',
		'birthDate',
		'placeOfBirth',
		'email',
		'phone',
		'profileImage',
	];

	private BonusTypeService = new BonusTypeRepo();

	private msg = new MessageFormation('TimesheetSchedule').message;

	private async updateTimesheetSchedule(data, id, transaction: Transaction = null) {
		try {
			return await TimesheetSchedule.update(data, {
				where: {
					id,
				},
				transaction,
			});
		} catch (error) {
			throw error;
		}
	}

	private calculateActiveStatus = async (
		currentStatus,
		currentBonus,
		updateStatus,
		date,
		overtimeBonus,
		oldOvertimeBonus,
		isStatus,
		isBonus,
	) => {
		const customBonus = await this.BonusTypeService.getAllBonusTypeServiceCode();
		if (updateStatus == 'W' && !(moment(date).format('d') == '5' || moment(date).format('d') == '6')) {
			if (isStatus) {
				return currentStatus;
			} else {
				return currentBonus;
			}
		}
		if (updateStatus == 'CLEARDB' && !oldOvertimeBonus) {
			// if (currentStatus.includes(',')) {
			// 	return currentStatus
			// 		.split(',')
			// 		.filter((item) => !BonusOptions.includes(item))
			// 		.join(',');
			// } else {
			// 	return BonusOptions.includes(currentStatus) ? '' : currentStatus;
			// }
			if (isStatus) {
				return currentStatus;
			} else {
				if (currentBonus?.includes(',')) {
					return currentBonus
						.split(',')
						.map((dat) => {
							if (!BonusOptions.includes(dat)) {
								return dat;
							}
							return null;
						})
						.filter((dat) => dat && dat)
						.join(',');
				} else {
					return BonusOptions?.includes(currentBonus) ? null : currentBonus;
				}
			}
		}
		if (updateStatus == 'CLEARCB' && !oldOvertimeBonus) {
			// if (currentStatus.includes(',')) {
			// 	return currentStatus
			// 		.split(',')
			// 		.filter((item) => !customBonus?.includes(item))
			// 		.join(',');
			// } else {
			// 		return customBonus?.includes(currentStatus) ? '' : currentStatus;
			// }
			if (isStatus) {
				return currentStatus;
			} else {
				if (currentBonus?.includes(',')) {
					return (
						currentBonus
							.split(',')
							.map((dat) => {
								if (!customBonus.includes(dat)) {
									return dat;
								}
								return null;
							})
							.filter((dat) => dat && dat)
							.join(',') || null
					);
				} else {
					return customBonus?.includes(currentBonus) ? null : currentBonus;
				}
			}
		}
		if (updateStatus == 'CLEARHOB' && oldOvertimeBonus) {
			// if (currentStatus.includes(',')) {
			// 	return currentStatus
			// 		.split(',')
			// 		.filter((item) => !BonusOptions.includes(item))
			// 		.join(',');
			// } else {
			// 	return BonusOptions.includes(currentStatus) ? '' : currentStatus;
			// }
			if (isStatus) {
				return currentStatus;
			} else {
				if (currentBonus?.includes(',')) {
					return currentBonus
						.split(',')
						.map((dat) => {
							if (!BonusOptions.includes(dat)) {
								return dat;
							}
							return null;
						})
						.filter((dat) => dat && dat)
						.join(',');
				} else {
					return BonusOptions?.includes(currentBonus) ? null : currentBonus;
				}
			}
		}
		if (updateStatus == 'CLEARFIELD') {
			if (isStatus) {
				return '';
			} else {
				return null;
			}
		}
		if (updateStatus == 'CLEARFIELDTOP') {
			if (isStatus) {
				return 'P';
			} else {
				return null;
			}
		}

		// if (currentStatus.includes(',')) {
		// 	const splitValues = currentStatus.split(',');
		// 	if (splitValues.some((item) => BonusOptions.indexOf(item) >= 0)) {
		// 		return currentStatus;
		// 	} else {
		// 		return `${currentStatus},${updateStatus}`;
		// 	}
		// }
		if (currentStatus === updateStatus || currentBonus === updateStatus) {
			if (isStatus) {
				return currentStatus;
			} else {
				return currentBonus;
			}
		}

		if (BonusOptions.includes(updateStatus) && overtimeBonus == null && isBonus) {
			if (currentStatus == 'P') {
				// return `${currentStatus},${updateStatus}`;
				if (isStatus) {
					return currentStatus;
				} else if (currentBonus?.split(',').find((dat) => dat == updateStatus)) {
					return currentBonus;
				} else {
					return currentBonus ? `${currentBonus},${updateStatus}` : updateStatus;
				}
			} else {
				if (isStatus) {
					return currentStatus;
				} else {
					return currentBonus;
				}
			}
		}

		if (customBonus.includes(updateStatus) && overtimeBonus == null && isBonus) {
			if (currentStatus == 'P' && isStatus) {
				return currentStatus;
			} else if (isStatus) {
				return '';
			} else if (currentBonus && currentBonus.includes(updateStatus)) {
				return currentBonus;
			} else {
				return currentBonus ? `${currentBonus},${updateStatus}` : updateStatus;
			}
		}

		if (updateStatus.includes('P,') || updateStatus.includes('W,')) {
			const splitValues = updateStatus.split(',');
			if (isStatus) {
				return splitValues[0];
			} else {
				return splitValues[1];
			}
		}

		if (updateStatus.includes('CHB')) {
			if (isStatus) {
				return 'CHB';
			} else {
				return updateStatus.split(',')[1];
			}
		}

		// if (
		// 	`${currentStatus},${updateStatus}`
		// 		.split(',')
		// 		.findIndex((dat) => [...leaveArray, ...absenceArray, ...presenceOptions].includes(dat))
		// ) {
		// 	if (isStatus) {
		// 		return currentStatus;
		// 	} else {
		// 		return currentBonus;
		// 	}
		// }
		// if (currentStatus == 'P' && updateStatus == 'P') {
		// }

		if (
			updateStatus !== 'CLEARDB' &&
			updateStatus !== 'CLEARCB' &&
			updateStatus !== 'CLEARHOB' &&
			updateStatus !== 'CLEARFIELD' &&
			updateStatus !== 'CLEARFIELDTOP'
		) {
			if (isStatus) {
				return updateStatus;
			} else {
				return null;
			}
		} else {
			if (isStatus) {
				return currentStatus;
			} else {
				return currentBonus;
			}
		}
	};

	async getAllTimesheetScheduleDetails(query: IQueryParameters, user: User) {
		const { clientId, activeTab, segmentId, subSegmentId, startDate, endDate, page, limit, search } = query;
		const finalResponse: {
			employeeDetails: EmployeeAttributes;
			totalReliquat: number;
			count: number;
			rows: TimesheetScheduleAttributes[];
			timesheetId: TimesheetAttributes;
			totalBonusCount: number;
		}[] = [];
		const momentStartDate = moment(startDate, this.dateFormat);
		const momentEndDate = moment(moment(endDate, this.dateFormat));
		let data;
		let includedCondition = {};
	
		if (activeTab == activeTabForTimesheetSchedule.All) {
			includedCondition = {
				clientId,
			};
			// data = await Employee.findAndCountAll({
			// 	...includedCondition,
			// 	where: { deletedAt: null, clientId },
			// 	offset: page && limit ? (page - 1) * limit : undefined,
			// 	limit: limit ? limit : undefined,
			// 	order: [['timeSheet', 'status', 'desc']],
			// });
		}
		if (activeTab == activeTabForTimesheetSchedule.AllSegment) {
			const subSegmentIds = getSubSegmentAccessForUser(user);
			const segmentIds = getSegmentAccessForUser(user);
			includedCondition = {
				clientId,
				...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
				...(subSegmentIds?.length > 0 && {
					[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
				}),
			};
		}
		if (activeTab == activeTabForTimesheetSchedule.Employee) {
			includedCondition = { clientId, segmentId: null, subSegmentId: null };
			// data = await Employee.findAndCountAll({
			// 	...includedCondition,
			// 	where: { deletedAt: null, clientId, segmentId: null, subSegmentId: null },
			// 	offset: page && limit ? (page - 1) * limit : undefined,
			// 	limit: limit ? limit : undefined,
			// 	order: [['timeSheet', 'status', 'desc']],
			// });
		}
		if (activeTab == activeTabForTimesheetSchedule.Segment) {
			includedCondition = { clientId, segmentId: segmentId, subSegmentId: null };
			// data = await Employee.findAndCountAll({
			// 	...includedCondition,
			// 	where: { deletedAt: null, clientId, segmentId: segmentId, subSegmentId: null },
			// 	offset: page && limit ? (page - 1) * limit : undefined,
			// 	limit: limit ? limit : undefined,
			// 	order: [['timeSheet', 'status', 'desc']],
			// });
		}
		if (activeTab == activeTabForTimesheetSchedule.SubSegment) {
			includedCondition = { clientId, subSegmentId: subSegmentId };
			// data = await Employee.findAndCountAll({
			// 	...includedCondition,
			// 	where: { deletedAt: null, clientId, subSegmentId: subSegmentId },
			// 	offset: page && limit ? (page - 1) * limit : undefined,
			// 	limit: limit ? limit : undefined,
			// 	order: [['timeSheet', 'status', 'desc']],
			// });
		}
		const segmentStartDate = moment(startDate, this.dateFormat).add(1, 'month').toDate();
		const segmentEndDate = moment(moment(endDate, this.dateFormat)).add(1, 'month').toDate();
		data = await Timesheet.findAndCountAll({
			attributes: ['id', 'status', 'startDate', 'endDate'],
			where: {
				...includedCondition,
				startDate: {
					[Op.or]: {
						[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
						[Op.eq]: momentStartDate.toDate(),
					},
				},
				endDate: {
					[Op.or]: {
						[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
						[Op.eq]: momentEndDate.toDate(),
					},
				},
			},
			include: [
				{
					model: Employee,
					required: true,
					where: {
						clientId,
					},
					include: [
						{
							model: Client,
							attributes: ['id', 'country', 'weekendDays', 'isAllDays', 'isCountCR', 'currency'],
						},
						{
							model: LoginUser,
							attributes: this.attributes,
							paranoid: false,
							where: {
								...(user.roleData.isViewAll &&
									user.roleData.name === DefaultRoles.Employee && { id: user.loginUserId }),
								...(search && {
									[Op.or]: [
										Sequelize.where(
											Sequelize.fn(
												'concat',
												Sequelize.col('employee.loginUserData.firstName'),
												' ',
												Sequelize.col('employee.loginUserData.lastName'),
											),
											{
												[Op.iLike]: `%${search}%`,
											},
										),
									],
								}),
							},
						},
						{
							model: ReliquatCalculation,
							separate: true,
							where: {
								startDate: {
									[Op.or]: {
										[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
										[Op.eq]: momentStartDate.toDate(),
									},
								},
								endDate: {
									[Op.or]: {
										[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
										[Op.eq]: momentEndDate.toDate(),
									},
								},
							},
						},
						{
							model: Timesheet,
							required: true,
							separate: true,
							include: [
								{
									model: Segment,
									paranoid: false,
								},
								{
									model: SubSegment,
									paranoid: false,
								},
							],
							where: {
								...includedCondition,
								startDate: {
									[Op.or]: {
										[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
										[Op.eq]: momentStartDate.toDate(),
									},
								},
								endDate: {
									[Op.or]: {
										[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
										[Op.eq]: momentEndDate.toDate(),
									},
								},
							},
						},
						{
							model: EmployeeRotation,
							separate: true,
							order: [['date', 'desc']],
							attributes: ['rotationId', 'date'],
							where: {
								date: {
									[Op.or]: {
										[Op.lte]: momentStartDate.toDate(),
										[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
									},
								},
							},
							include: [
								{
									model: Rotation,
									attributes: ['isResident', 'name', 'weekOn', 'weekOff', 'isOvertimeBonus'],
								},
							],
						},
						{
							model: Rotation,
							attributes: ['id', 'name', 'isResident','weekOn', 'weekOff', 'isOvertimeBonus'],
						},
						{
							model: ReliquatPayment,
							where: {
								startDate: {
									[Op.gte]: momentStartDate.toDate(),
									[Op.lte]: momentEndDate.toDate(),
								},
							},
							required: false,
							attributes: ['id', 'amount'],
						},
						{
							model: ReliquatAdjustment,
							where: {
								startDate: momentStartDate.toDate(),
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
									[Op.lte]: momentEndDate.toDate(),
								},
								endDate: {
									[Op.or]: {
										[Op.eq]: null,
										[Op.gte]: momentStartDate.toDate(),
									},
								},
							},
							include: [
								{
									model: BonusType,
									attributes: ['id', 'name', 'code'],
								},
							],
						},
					],
					paranoid: false,
					order: [
						['employee', 'timesheet', 'status', 'desc'],
						['employee', 'loginUserData', 'lastName', 'asc'],
						['employee', 'employeeSegment', 'date', 'desc'],
					],
				},
			],
			order: [['status', 'desc']],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
		});

		data = parse(data);

		for (const userDat in data.rows) {
			const findTimesheetIndex = data?.rows[userDat].employee.timeSheet.findIndex(
				(e) => e?.startDate === data.rows[userDat].startDate,
			);
			const findReliquatIndex = data?.rows[userDat].employee.reliquatCalculation.findIndex(
				(e) => e?.startDate === data.rows[userDat].startDate,
			);
			const newTimesheetArr = [];
			const newReliquatCalculationArr = [];
			newTimesheetArr.push(data.rows[userDat].employee.timeSheet[findTimesheetIndex]);
			newReliquatCalculationArr.push(data.rows[userDat].employee.reliquatCalculation[findReliquatIndex]);
			data.rows[userDat].employee.timeSheet = newTimesheetArr;
			data.rows[userDat].employee.reliquatCalculation = newReliquatCalculationArr;
			const splitStartDate = moment(data.rows[userDat].startDate).utc();
			const splitEndDate = moment(data.rows[userDat].endDate).utc();
			data.rows[userDat] = data.rows[userDat]?.employee;
			let resp = await TimesheetSchedule.findAll({
				where: {
					employeeId: data.rows[userDat].id,
					date: {
						[Op.between]: [splitStartDate, splitEndDate],
					},
				},
				order: [['date', 'asc']],
			});
			resp = parse(resp);
			const insData = resp.filter((dat) => dat.employeeId === data.rows[userDat].id);
			let reliquatValue: number;
			const reliquatCalculationData = await ReliquatCalculation.findOne({
				where: {
					[Op.and]: [
						{
							startDate: { [Op.lte]: splitStartDate.toDate() },
						},
						{
							endDate: { [Op.lte]: splitEndDate.toDate() },
						},
					],
					clientId,
					employeeId: data.rows[userDat]?.id,
				},
				order: [['startDate', 'desc']],
			});
			data.rows[userDat].reliquatCalculation = [];
			data.rows[userDat].reliquatCalculation?.push(reliquatCalculationData);
			if (
				moment(data.rows[userDat]?.terminationDate).isBetween(splitStartDate.toDate(), splitEndDate.toDate()) ||
				moment(data.rows[userDat]?.terminationDate).isSame(splitStartDate.toDate()) ||
				moment(data.rows[userDat]?.terminationDate).isSame(splitEndDate.toDate())
			) {
				const reliquatCalculation = reliquatCalculationData?.reliquat;
				reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
			} else if (
				data.rows[userDat]?.employeeSegment?.length > 0 &&
				!data.rows[userDat]?.employeeSegment?.[0]?.rollover
			) {
				const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
					employeeId: String(data.rows[userDat].id),
					date: moment(
						moment(data.rows[userDat]?.employeeSegment?.[0]?.date).subtract(1, 'day').format('DD-MM-YYYY'),
						'DD-MM-YYYY',
					).toDate(),
				});
				reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
			} else {
				reliquatValue = 0;
			}

			const totalBonusCount = insData?.filter(
				(bonusCountData) => !bonusCountData?.status && bonusCountData?.bonusCode,
			)?.length;

			finalResponse.push({
				employeeDetails: data.rows[userDat],
				totalReliquat: reliquatValue,
				count: insData.length,
				rows: insData,
				timesheetId: data.rows[userDat]?.timesheet?.id,
				totalBonusCount: totalBonusCount,
			});
		}
		const responseObj = {
			data: finalResponse,
			count: finalResponse?.length,
			totalCount: data.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};

    // await createHistoryRecord({
    //   tableName: tableEnum.TIMESHEET_SCHEDULE,
    //   moduleName: moduleName.TIMESHEETS,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.TIMESHEET_SCHEDULE, `All Timesheet Schedule Details!`),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
		return responseObj;
	}

	async getTimesheetScheduleByIdService(query: IQueryParameters) {
		const { employeeId, startDate, endDate } = query;

		const finalResponse: { count: number; rows: TimesheetScheduleAttributes[] }[] = [];
		const momentStartDate = moment(startDate, this.dateFormat)
			.utcOffset(moment(startDate, this.dateFormat).utcOffset())
			.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
		const momentEndDate = moment(
			moment(endDate, this.dateFormat).utcOffset(moment(endDate, this.dateFormat).utcOffset()),
		)
			.set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
			.add(1, 'days');
		let resp = await TimesheetSchedule.findAndCountAll({
			where: {
				deletedAt: null,
				employeeId: employeeId,
				[Op.or]: [
					{
						date: {
							[Op.between]: [momentStartDate.toDate(), momentEndDate.toDate()],
						},
					},
				],
			},
			distinct: true,
		});
		resp = parse(resp);
		finalResponse.push({
			count: resp.count,
			rows: resp.rows,
		});
		const responseObj = {
			data: finalResponse,
			currentPage: undefined,
			limit: undefined,
			lastPage: undefined,
		};
		return responseObj;
	}

	async addTimesheetScheduleService({ allValues, transaction }) {
		await TimesheetSchedule.bulkCreate(allValues, {
			ignoreDuplicates: true,
			transaction,
		});
	}

	async deleteTimesheetService({ id }: { id: number }) {
		const isFound = await TimesheetSchedule.findOne({ where: { id: id } });
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = await TimesheetSchedule.destroy({ where: { id: id } });
		return data;
	}

async updateTimesheetScheduleById(
	ids: number[],
	updateStatus: string,
	user: User,
	isLeave: boolean,
	isBonus: boolean,
	isTimesheetApplied: boolean,
	transaction: Transaction = null,
	overtimeHours?: number,
) {
	try {
		// ✅ Log input parameters
		console.log('🔍 Input Params:', {
			ids,
			updateStatus,
			isLeave,
			isBonus,
			isTimesheetApplied,
			overtimeHours,
			userId: user?.id,
		});

		// ✅ Early validation for updateStatus
		if (!updateStatus) {
			console.error('❌ updateStatus is missing!');
			throw new HttpException(400, 'Update Status Is Required', {}, true);
		}

		let allTimesheetUpdateVars = await TimesheetSchedule.findAll({
			where: {
				id: {
					[Op.in]: ids,
				},
			},
			include: [
				{
					model: Employee,
					attributes: ['id'],
					include: [
						{
							model: EmployeeBonus,
							required: false,
							include: [
								{
									model: BonusType,
									required: false,
									where: {
										code: updateStatus,
									},
								},
							],
						},
					],
				},
			],
			transaction,
		});

		allTimesheetUpdateVars = parse(allTimesheetUpdateVars);

		console.log('📄 Fetched Timesheets:', allTimesheetUpdateVars.length);

		// ❗ Check if "Titre de Congé" condition blocks update
		if (
			allTimesheetUpdateVars.findIndex((timesheetData) => timesheetData.status === 'CR') >= 0 &&
			updateStatus !== 'CR' &&
			isTimesheetApplied
		) {
			console.warn('⚠️ Titre de Congé exists, cancel before updating!');
			throw new HttpException(200, 'Please cancel the Titre de Congé before updating status', {}, true);
		}

		const bonusData = await BonusType.findAll({
			attributes: ['id', 'code'],
		});
		const bonusArrList = bonusData.map((e) => e?.code);

		console.log('🎁 Bonus Codes Available:', bonusArrList);

		if (
			bonusArrList.includes(updateStatus) &&
			isBonus &&
			allTimesheetUpdateVars.some((e) => e?.employee?.employeeBonus?.length === 0)
		) {
			console.warn('❌ Selected bonus not available on some employees');
			throw new HttpException(200, 'Bonus selected does not exist on employee!', {}, true);
		}

		for (const data of allTimesheetUpdateVars) {
			console.log(`🔁 Updating Timesheet ID: ${data.id}`);

			let empData: EmployeeAttributes = await Employee.findOne({
				include: { model: Rotation, as: 'rotation' },
				where: { id: data?.employeeId },
				transaction,
			});
			empData = parse(empData);

			if (BonusOptions.includes(updateStatus)) {
				console.log('🔍 Bonus status check for rotation:', empData);
				if (empData['rotation'].isWeekendBonus == false && updateStatus == 'W') return allTimesheetUpdateVars;
				if (empData['rotation'].isOvertimeBonus == false && updateStatus == 'O1') return allTimesheetUpdateVars;
				if (empData['rotation'].isOvertimeBonus == false && updateStatus == 'O2') return allTimesheetUpdateVars;
			}

			if (
				bonusArrList.includes(updateStatus) &&
				isBonus &&
				data?.status !== 'P' &&
				empData['rotation'].name !== 'Call Out'
			) {
				console.warn('❌ Bonus applied on non-Present day or disallowed rotation.');
				throw new HttpException(200, 'Bonus can only be assigned on Present Days!', {}, true);
			}

			await this.updateTimesheetSchedule(
				{
					status: await this.calculateActiveStatus(
						data.status,
						data.bonusCode,
						updateStatus,
						data.date,
						overtimeHours || null,
						data.overtimeHours,
						true,
						updateStatus == 'P' &&
							empData['rotation']?.id &&
							empData['rotation']?.weekOn == null &&
							empData['rotation']?.weekOff == null &&
							empData['rotation']?.isResident == false
							? true
							: isBonus || false,
					),
					isLeaveForTitreDeConge: isLeave || false,
					bonusCode: await this.calculateActiveStatus(
						data.status,
						data.bonusCode,
						updateStatus,
						data.date,
						overtimeHours || null,
						data.overtimeHours,
						false,
						updateStatus == 'P' &&
							empData['rotation']?.id &&
							empData['rotation']?.weekOn == null &&
							empData['rotation']?.weekOff == null &&
							empData['rotation']?.isResident == false
							? true
							: isBonus || false,
					),
					updatedBy: user.id,
					updatedAt: new Date(),
					overtimeHours:
						overtimeHours ||
						(updateStatus.includes('CLEAR') && updateStatus != 'CLEARFIELD' && updateStatus != 'CLEARFIELDTOP'
							? data.overtimeHours
							: null),
				},
				data.id,
				transaction,
			);
		}

		console.log('✅ Timesheet updates completed.');
		return allTimesheetUpdateVars;
	} catch (error) {
		console.error('💥 Error in updateTimesheetScheduleById:', error);
		throw error;
	}
}


async updateTimesheetScheduleByEmployeeId(body: {
  startDate: Date;
  endDate: Date;
  employeeId: number;
  updateStatus: string;
  overtimeBonusType?: string;
  isBonus: boolean;
  overtimeHours?: number;
  isTimesheetApplied: boolean;
  user: User;
  transaction: Transaction;
}) {
  const transaction = body.transaction || null;

  try {
    // ✅ Log incoming payload
    console.log("▶️ Called updateTimesheetScheduleByEmployeeId with body:", {
      startDate: body.startDate,
      endDate: body.endDate,
      employeeId: body.employeeId,
      updateStatus: body.updateStatus,
      isBonus: body.isBonus,
      overtimeHours: body.overtimeHours,
    });

    // ✅ Check and log if updateStatus is missing
    if (!body.updateStatus) {
      console.error("❌ updateStatus is missing in updateTimesheetScheduleByEmployeeId");
      throw new HttpException(400, "Update Status Is Required", {}, true);
    }

    const startDate = moment(body.startDate).utc();
    const endDate = moment(body.endDate).utc();

    // ✅ Log date range used for querying
    console.log("📅 Date range for TimesheetSchedule query:", {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const resp = await TimesheetSchedule.findAll({
      attributes: ["id"],
      where: {
        deletedAt: null,
        employeeId: body.employeeId,
        [Op.or]: [
          {
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      },
      transaction,
      order: [["date", "asc"]],
    });

    // ✅ Log found schedule IDs
    const ids = resp?.map((obj) => obj.id);
    console.log("🆔 TimesheetSchedule IDs to update:", ids);

    return await this.updateTimesheetScheduleById(
      ids,
      body.updateStatus,
      body.user,
      false,
      body.isBonus || false,
      body.isTimesheetApplied,
      transaction,
      body?.overtimeHours ||
        (body.updateStatus === "CLEARFIELD" || body.updateStatus === "CLEARFIELDTOP"
          ? null
          : body?.overtimeHours)
    );
  } catch (error) {
    console.error("🔥 Error in updateTimesheetScheduleByEmployeeId:", error);
    throw error;
  }
}


	async deleteTimesheetServiceByEid(scheduleRecords: { eid: number; date: Date }[], transaction) {
		await TimesheetSchedule.destroy({ where: { [Op.or]: [...scheduleRecords] }, transaction });
	}
}