import { FRONTEND_URL } from '@/config';
import { QueryParser } from '@/helpers/queryParser/query.parser';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import Employee from '@/models/employee.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
import ReliquatAdjustment from '@/models/reliquatAdjustment.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import ReliquatCalculationV2 from '@/models/reliquatCalculationV2.model';
import ReliquatPayment from '@/models/reliquatPayment.model';
import Role from '@/models/role.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import { parse } from '@/utils/common.util';
import { Request } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { Op, Transaction } from 'sequelize';
import BaseRepository from './base.repository';
import { sendMail } from '@/helpers/mail.helper';

export default class ReliquatCalculationV2Repo extends BaseRepository<ReliquatCalculationV2> {
	constructor() {
		super(ReliquatCalculationV2.name);
	}

	async getAllReliquatCalculationV2Service(req: Request) {
		const { page, limit, clientId, employeeId, sortBy, sort }: IQueryParameters = req.query;
		const sortedColumn = sortBy || null;
		const where = !_.isEmpty(clientId) ? { clientId: Number(clientId) } : {};
		const queryBuild = new QueryParser({ request: req, model: ReliquatCalculationV2 }).getFullQuery();
		const employeeLoginData = await Employee.findOne({
			where: {
				id: employeeId,
			},
			attributes: ['id', 'loginUserId'],
		});
		const isEmployeeLogin = await Role.findOne({
			where: {
				name: 'Employee',
				deletedAt: null,
			},
			attributes: ['id', 'name'],
		});
		let data = await this.getAllData({
			where: { ...queryBuild.where, ...where },
			include: [
				{
					model: Employee,
					attributes: ['id', 'loginUserId', 'employeeNumber'],
					as: 'employee',
					where: {
						...(employeeLoginData?.loginUserId && { loginUserId: employeeLoginData?.loginUserId }),
						...(isEmployeeLogin?.id === req?.user?.roleId && {
							id: employeeLoginData.id,
						}),
					},
					include: [
						{ model: LoginUser, attributes: ['firstName', 'lastName'] },
						{
							model: Segment,
							attributes: ['id', 'code', 'name'],
						},
						{
							model: SubSegment,
							attributes: ['id', 'code', 'name'],
						},
						{
							model: Rotation,
							attributes: ['name', 'id', 'weekOn', 'weekOff', 'description'],
						},
					],
				},
				{
					model: Timesheet,
					attributes: ['id', 'status'],
				},
			],

			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'startDate', sort ?? 'asc']],
			attributes: queryBuild.attributes,
		});
		data = parse(data);
		let calculation = 0;
		const result = data?.rows
			?.map((val, inx) => {
				calculation = calculation + val.reliquat;
				return { ...val, calculation: calculation, inx: inx + 1 };
			})
			.sort((a, b) => b.inx - a.inx);
		const responseObj = {
			data: result,
			count: data?.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};
		return responseObj;
	}

	async getEmployeeReliquatData(req: Request) {
		const { clientId, employeeId }: IQueryParameters = req.query;
		const where = !_.isEmpty(clientId) ? { clientId: Number(clientId) } : {};
		const queryBuild = new QueryParser({ request: req, model: ReliquatCalculationV2 }).getFullQuery();
		let data = await this.getAllData({
			where: { ...queryBuild.where, ...where },
			include: [
				{
					model: Employee,
					attributes: ['id', 'loginUserId', 'employeeNumber'],
					as: 'employee',
					where: {
						...(employeeId !== undefined && { id: employeeId }),
					},
				},
				{
					model: Timesheet,
					attributes: ['id', 'status'],
				},
			],
			order: [['id', 'asc']],
			attributes: queryBuild.attributes,
		});
		data = parse(data);
		let calculation = 0;
		const result = data?.rows
			?.map((val) => {
				calculation = calculation + val.reliquat;
				return { ...val, calculation: calculation };
			})
			.sort((a, b) => b.id - a.id);
		const responseObj = { result: result.length ? result[0].calculation : 0 };
		return responseObj;
	}

	async generateReliquatCalculationV2(
		employeeId: number[],
		timesheetId: number,
		userId: number,
		transaction: Transaction = null,
	) {
		await Promise.all(
			employeeId?.map(async (id: number) => {
				let employeeData = await Employee.findOne({
					where: { id: id, deletedAt: null },
					include: [
						{
							model: Rotation,
							attributes: [
								'name',
								'description',
								'weekOn',
								'weekOff',
								'isResident',
								'isWeekendBonus',
								'isOvertimeBonus',
							],
						},
						{ model: Segment, attributes: ['code', 'name'] },
						{ model: SubSegment, attributes: ['code', 'name'] },
						{ model: LoginUser, attributes: ['firstName', 'lastName', 'email'] },
					],
					transaction,
				});
				employeeData = parse(employeeData);
				if (employeeData) {
					let flag = true;
					let isExistReliquat = null;
					let timesheetData = await Timesheet.findOne({
						where: {
							deletedAt: null,
							id: timesheetId,
							startDate: {
								[Op.lte]: moment().add('1', 'month').startOf('month').toDate(),
							},
						},
						attributes: ['startDate', 'endDate', 'clientId', 'id'],
						transaction,
					});
					timesheetData = parse(timesheetData);
					if (timesheetData) {
						const employeeSegment = await EmployeeSegment.findOne({
							where: {
								employeeId: id,
								date: {
									[Op.lte]: moment(timesheetData.endDate).toDate(),
								},
							},
							include: [{ model: Segment }, { model: SubSegment }],
							order: [['date', 'desc']],
						});

						const isBetweenSegment = await EmployeeSegment.findOne({
							where: {
								employeeId: id,
								date: {
									[Op.gt]: moment(timesheetData.startDate).toDate(),
									[Op.lt]: moment(timesheetData.endDate).toDate(),
								},
							},
						});
						if (isBetweenSegment) {
							const isExistReliquatData = await ReliquatCalculationV2.findOne({
								where: { employeeId: id, startDate: moment(timesheetData.startDate).toDate() },
							});
							isExistReliquat = isExistReliquatData ? isExistReliquatData?.id : null;
							flag = false;
						}
						let reliquatCalculationRecord = await ReliquatCalculation.findOne({
							where: {
								employeeId: +id,
								deletedAt: null,
								[Op.and]: [
									{
										startDate: { [Op.lte]: timesheetData.startDate },
									},
									{
										endDate: { [Op.gte]: timesheetData.endDate },
									},
								],
							},
							transaction,
						});
						reliquatCalculationRecord = parse(reliquatCalculationRecord);

						const employeeRotation = await EmployeeRotation.findOne({
							where: {
								employeeId: id,
								date: {
									[Op.lte]: moment(timesheetData.endDate).toDate(),
								},
							},
							include: [{ model: Rotation }],
							order: [['date', 'desc']],
						});

						const segmentName = employeeSegment
							? `${employeeSegment?.segment?.name}${
									employeeSegment?.subSegment ? '-' + employeeSegment?.subSegment?.name : ''
							  }`
							: employeeData?.segment?.name;
						const rotationData = employeeRotation?.rotation || employeeData.rotation;
						await ReliquatCalculationV2.destroy({
							where: { timesheetId: timesheetId, employeeId: id },
							transaction,
							force: true,
						});
						if (rotationData && rotationData?.name !== 'Call Out') {
							const rotationName = `${rotationData?.weekOff || 0}/${rotationData?.weekOn || 0}`;

							let reliquat = '0';
							const momentStartDate = moment(timesheetData.startDate);
							const momentEndDate = moment(timesheetData.endDate);
							let timesheetScheduleData = await TimesheetSchedule.findAndCountAll({
								where: {
									deletedAt: null,
									employeeId: employeeData.id,
									[Op.or]: [
										{
											date: {
												[Op.between]: [momentStartDate.utc(), momentEndDate.utc()],
											},
										},
									],
								},
								transaction,
								order: [['date', 'asc']],
							});
							timesheetScheduleData = parse(timesheetScheduleData);

							let adjustmentValue = 0;
							let reliquatAdjustmentData = await ReliquatAdjustment.findAll({
								where: { employeeId: employeeData?.id, clientId: employeeData?.clientId },
								transaction,
							});
							reliquatAdjustmentData = parse(reliquatAdjustmentData);
							reliquatAdjustmentData?.map((adjustment) => {
								const isBetween = moment(adjustment.startDate).isBetween(momentStartDate, momentEndDate, null, '[]');
								if (isBetween) adjustmentValue = adjustment.adjustment;
							});

							let paymentValue = 0;
							let reliquatPaymentData = await ReliquatPayment.findAll({
								where: { employeeId: employeeData?.id, clientId: employeeData?.clientId },
								transaction,
							});
							reliquatPaymentData = parse(reliquatPaymentData);
							reliquatPaymentData?.map((payment) => {
								const isBetween = moment(payment.startDate).isBetween(momentStartDate, momentEndDate, null, '[]');
								if (isBetween) paymentValue += payment.amount;
							});

							let worked = 0;
							let taken = 0;
							let total = 0;
							let overTime = 0;
							let weekendDays = 0;
							timesheetScheduleData?.rows?.map((schedule) => {
								if (isBetweenSegment) {
									if (isExistReliquat) {
										flag =
											moment(schedule.date).isSame(moment(isBetweenSegment.date)) ||
											moment(schedule.date).isAfter(moment(isBetweenSegment.date));
										if (moment(schedule.date).isSame(moment(isBetweenSegment.date)))
											timesheetData.startDate = moment(schedule.date).toDate();
									} else {
										flag = moment(schedule.date).isSameOrBefore(moment(isBetweenSegment.date).add(1, 'days'));
										timesheetData.endDate = moment(isBetweenSegment.date).subtract(1, 'days').toDate();
									}
								}
								if (flag) {
									if (schedule.status) {
										// const splitStatus = schedule.status.split(',');
										const splitStatus = schedule.bonusCode ? schedule.bonusCode?.split(',') : '';
										// Calculate Total Days
										if (!['-', 'A', 'M'].some((item) => splitStatus.includes(item))) total++;

										// Calculate Overtime Days
										if (['O2'].some((item) => splitStatus.includes(item))) overTime = overTime + 2;
										if (['O1'].some((item) => splitStatus.includes(item))) overTime++;

										// Calculate Weekend Days
										if (['W'].some((item) => splitStatus.includes(item)))
											weekendDays = moment(schedule.date).format('d') == '5' ? weekendDays + 2 : weekendDays + 1;
									}
									if (['P', 'O2', 'O1', 'W', 'TR'].includes(schedule.status)) worked++;
									else if (schedule.status === 'CR') taken++;
								}
							});
							let earned = '0';
							if (rotationData?.weekOff && rotationData?.weekOn) {
								if (rotationData?.isResident) {
									earned = (total * (rotationData?.weekOff / rotationData?.weekOn)).toFixed(1);
								} else {
									earned = (worked * (rotationData?.weekOff / rotationData?.weekOn)).toFixed(1);
								}
							}

							const earnedTaken = Number(earned) - taken;
							const ETPayment = earnedTaken - paymentValue;
							const ERAdjustment = ETPayment + adjustmentValue;
							reliquat = (ERAdjustment + overTime + weekendDays + Number(reliquat)).toFixed(1);

							if (Number(reliquat) < 0) {
								if (employeeData?.loginUserData?.email) {
									const context = {
										userName: employeeData?.loginUserData?.firstName + ' ' + employeeData?.loginUserData?.lastName,
										startDate: moment(timesheetData.startDate).format('DD/MM/YYYY'),
										endDate: moment(timesheetData.endDate).format('DD/MM/YYYY'),
										reliquat: Number(reliquat),
										logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
									};
									// await sendMail([employeeData?.loginUserData?.email,'admin@lred.com'], 'Low Reliquat', 'lowReliquat', context);
								}
							}

							await ReliquatCalculationV2.create(
								{
									clientId: employeeData.clientId,
									timesheetId: timesheetData.id,
									employeeId: id,
									rotationName: rotationName,
									segmentName: segmentName,
									taken: taken,
									presentDay: worked,
									earned: Number(earned),
									earnedTaken: Number((Number(earned) - taken - paymentValue).toFixed(1)),
									totalWorked: total,
									weekend: weekendDays,
									overtime: overTime,
									adjustment: adjustmentValue,
									reliquatPayment: paymentValue,
									reliquatValue: Number(reliquatCalculationRecord?.reliquatValue ?? 0),
									reliquat: Number(reliquat),
									startDate: moment(timesheetData.startDate).toDate(),
									endDate: moment(timesheetData.endDate).toDate(),
									createdBy: userId,
								},
								{ transaction },
							);
						}
					}
				}
			}),
		);
	}
}
