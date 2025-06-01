import { RolePermissionAttributes } from '@/interfaces/model/rolePermission.interface';
import { status } from '@/interfaces/model/user.interface';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import LoginUser from '@/models/loginUser.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import User from '@/models/user.model';
import UserPermission from '@/models/userPermission.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import mssqldb from '@/mssqldb';
import ClientRepo from '@/repository/client.repository';
import { createRandomHash, generateUniquePassword } from '@/utils/common.util';
import moment from 'moment';
import slugify from 'slugify';
import { FRONTEND_URL } from '@/config';
import { sendMail } from '@/helpers/mail.helper';
const clientRepo = new ClientRepo();

interface IEmployeeData {
	EmployeeId: string;
	Id: string;
	EmployeeClientId: string;
	ClientId: string;
	EmployeeNumber: string | null;
	TempNumber: string | null;
	ContractNumber: string | null;
	ContractSignedDate: Date | null;
	StartDate: Date | null;
	FirstName: string;
	LastName: string;
	Function: string | null;
	DOB: Date | null;
	PlaceOfBirth: string | null;
	NSS: string | null;
	Male: boolean;
	SegmentId: string | null;
	SubSegmentId: string | null;
	RotationId: string | null;
	TerminationDate: Date | null;
	BaseSalary: number | null;
	TravelAllowance: number | null;
	Housing: number | null;
	MonthlySalary: number | null;
	Address: string | null;
	MedicalCheckDate: Date | null;
	MedicalCheckExpiry: Date | null;
	MedicalInsurance: boolean | null;
	ContractEndDate: Date | null;
	DailyCost: number | null;
	MobileNumber: string | null;
	NextOfKinMobile: string | null;
	InitialBalance: number | null;
	PhotoVersionNo: number | null;
	Email: string | null;
	SegmentClientId: string | null;
	SegmentName: string | null;
	SegmentCode: string | null;
	SubSegmentCode: string | null;
	SubSegmentName: string | null;
	Name: string;
	WeeksOn: number | null;
	WeeksOff: number | null;
	Resident: boolean;
	Monday: boolean;
	Tuesday: boolean;
	Wednesday: boolean;
	Thursday: boolean;
	Friday: boolean;
	Saturday: boolean;
	Sunday: boolean;
	WeekendBonus: boolean;
	OvertimeBonus: boolean;
	RotationName: string;
}

interface IRotationData {
	Id: string;
	ClientId: string;
	Name: string;
	WeeksOn: number | null;
	WeeksOff: number | null;
	Resident: boolean;
	Monday: boolean;
	Tuesday: boolean;
	Wednesday: boolean;
	Thursday: boolean;
	Friday: boolean;
	Saturday: boolean;
	Sunday: boolean;
	WeekendBonus: boolean;
	OvertimeBonus: boolean;
}

async function processRotationData(data: IRotationData) {
	const weekOn = data.WeeksOn;
	const weekOff = data.WeeksOff;

	const daysOfWeek = {
		Monday: data.Monday,
		Tuesday: data.Tuesday,
		Wednesday: data.Wednesday,
		Thursday: data.Thursday,
		Friday: data.Friday,
		Saturday: data.Saturday,
		Sunday: data.Sunday,
	};

	const workedDays = Object.keys(daysOfWeek).filter((day) => daysOfWeek[day]);

	const daysWorked = workedDays.join(',');
	const isAllDays = workedDays.length === 7;

	let description = '';

	if (data.Resident) {
		if (weekOff != undefined) {
			description = `Resident ${weekOff} days off, working ${isAllDays ? 'all days' : daysWorked}`;
		}
	} else if (weekOn != undefined && weekOff != undefined) {
		description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
	}

	return {
		name: data.Name,
		weekOn,
		weekOff,
		isResident: data.Resident,
		daysWorked: daysWorked || null,
		isAllDays,
		isWeekendBonus: data.WeekendBonus,
		isOvertimeBonus: data.OvertimeBonus,
		description: description || null,
	};
}

(async function injectEmployee() {
	const result = await mssqldb.query(
		'SELECT rd_Employee.Id as EmployeeId,rd_Employee.ClientId as EmployeeClientId,rd_Employee.*,rd_Segment.ClientId as SegmentClientId,rd_Segment.Name as SegmentName,rd_Segment.Code as SegmentCode,rd_SubSegment.Code as SubSegmentCode,rd_SubSegment.Name as SubSegmentName,rd_Rotation.*,rd_Rotation.Name as RotationName FROM rd_Employee LEFT JOIN rd_Segment on rd_Employee.SegmentId=rd_Segment.Id LEFT JOIN rd_SubSegment ON rd_Employee.SubSegmentId=rd_SubSegment.Id LEFT JOIN rd_Rotation ON rd_Employee.RotationId=rd_Rotation.id WHERE rd_Employee.StartDate IS NOT NULL',
	);
	console.log('info', '------------------------- Start Employee Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IEmployeeData[]) {
			try {
				let loginUserId = null;
				const isExistEmail =
					(await LoginUser.findOne({
						where: {
							uniqueLoginId: `${data.FirstName}${data.LastName}${data.DOB ? moment(data.DOB).format('YYYYMMDD') : ''}`
								.replace(' ', '')
								.toLowerCase(),
							deletedAt: null,
						},
					})) || null;
				const randomPassword = generateUniquePassword();
				if (!isExistEmail) {
					const loginData = {
						email: data.Email,
						name: data.FirstName + ' ' + data.LastName,
						timezone: null,
						firstName: data.FirstName,
						lastName: data.LastName,
						birthDate: data.DOB ? moment(data.DOB).toDate() : null,
						placeOfBirth: data.PlaceOfBirth,
						gender: data.Male ? 'Male' : 'Female',
						phone: data.MobileNumber,
						randomPassword: randomPassword,
						code: randomPassword,
						isMailNotification: false,
						uniqueLoginId: `${data.FirstName}${data.LastName}${data.DOB ? moment(data.DOB).format('YYYYMMDD') : ''}`
							.replace(' ', '')
							.toLowerCase(),
					};
					const loginUserData = await LoginUser.create(loginData);
					loginUserId = loginUserData.id;
				} else {
					loginUserId = isExistEmail.id;
				}

				const clientData = await clientRepo.get({
					where: { oldClientId: data.EmployeeClientId, deletedAt: null },
				});

				const isExistSegment = await Segment.findOne({
					where: { name: data.SegmentName, code: data.SegmentCode, deletedAt: null },
					include: [{ model: Client, where: { oldClientId: data.SegmentClientId } }],
				});

				const isExistSubSegment = await SubSegment.findOne({
					where: {
						name: data.SubSegmentName,
						code: data.SubSegmentCode,
						segmentId: isExistSegment?.id || null,
						deletedAt: null,
					},
				});

				const rotationData = await processRotationData({
					Id: data.RotationId,
					ClientId: data.ClientId,
					Monday: data.Monday,
					Tuesday: data.Tuesday,
					Wednesday: data.Wednesday,
					Thursday: data.Thursday,
					Friday: data.Friday,
					Saturday: data.Saturday,
					Sunday: data.Sunday,
					Name: data.RotationName,
					WeeksOn: data.WeeksOn,
					WeeksOff: data.WeeksOff,
					OvertimeBonus: data.OvertimeBonus,
					WeekendBonus: data.WeekendBonus,
					Resident: data.Resident,
				});
				const isExistRotation = await Rotation.findOne({ where: { ...rotationData } });

				const slugifyEmployee = data.EmployeeNumber + createRandomHash(5);
				const slug = slugify(slugifyEmployee, { lower: true, replacement: '-' });
				const employeeData = {
					loginUserId: loginUserId,
					clientId: clientData.id,
					employeeNumber: data.EmployeeNumber,
					TempNumber: data.TempNumber,
					contractNumber: data.ContractNumber,
					contractSignedDate: data.ContractSignedDate ? moment(data.ContractSignedDate).toDate() : null,
					startDate: data.StartDate ? moment(data.StartDate).toDate() : null,
					fonction: data.Function,
					nSS: data.NSS,
					terminationDate: data.TerminationDate ? moment(data.TerminationDate).toDate() : data.TerminationDate,
					baseSalary: data.BaseSalary,
					travelAllowance: data.TravelAllowance,
					Housing: data.Housing,
					monthlySalary: data.MonthlySalary,
					address: data.Address,
					medicalCheckDate: data.MedicalCheckDate ? moment(data.MedicalCheckDate).toDate() : null,
					medicalCheckExpiry: data.MedicalCheckExpiry ? moment(data.MedicalCheckExpiry).toDate() : null,
					medicalInsurance: data.MedicalInsurance,
					contractEndDate: data.ContractEndDate ? moment(data.ContractEndDate).toDate() : null,
					dailyCost: data.DailyCost,
					nextOfKinMobile: data.NextOfKinMobile,
					initialBalance: data.InitialBalance,
					photoVersionNumber: data.PhotoVersionNo,
					segmentId: isExistSegment?.id || null,
					subSegmentId: isExistSubSegment?.id || null,
					rotationId: isExistRotation?.id || null,
					customBonus: null,
					slug: slug,
					oldEmployeeId: data.EmployeeId,
				};
				const isExistEmployee = await Employee.findOne({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });
				if (!isExistEmployee) {
					const resultEmployeeData = await Employee.create(employeeData);
					if (resultEmployeeData?.id) {
						// if (isExistRotation?.id) {
						// 	await EmployeeRotation.create({
						// 		employeeId: resultEmployeeData?.id,
						// 		rotationId: isExistRotation?.id,
						// 		date: moment(moment(data?.StartDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						// 	});
						// }
						// await EmployeeSalary.create({
						// 	employeeId: resultEmployeeData?.id,
						// 	baseSalary: Number(data?.BaseSalary ?? 0.0),
						// 	monthlySalary: Number(data?.MonthlySalary ?? 0.0),
						// 	dailyCost: Number(data?.DailyCost ?? 0.0),
						// 	startDate: data?.StartDate ? moment(data?.StartDate).toDate() : new Date(),
						// 	endDate: null,
						// });
						// if (isExistSegment?.id) {
						// 	await EmployeeSegment.create({
						// 		employeeId: resultEmployeeData?.id,
						// 		segmentId: isExistSegment?.id || null,
						// 		subSegmentId: isExistSubSegment?.id || null,
						// 		date: moment(moment(data?.StartDate || null).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						// 	});
						// }
						if (data.Email && !isExistEmail) {
							const roleData = await Role.findOne({
								where: { name: 'Employee', deletedAt: null },
								include: [{ model: RolePermission, attributes: ['permissionId'] }],
							});
							if (roleData) {
								await User.create({
									loginUserId: loginUserId,
									roleId: roleData.id,
									status: status.ACTIVE,
								});
								roleData?.assignedPermissions?.map(async (permission: RolePermissionAttributes) => {
									await UserPermission.create({
										permissionId: permission.permissionId,
										loginUserId: loginUserId,
										roleId: roleData.id,
									});
								});
								const replacement = {
									username: data.FirstName + ' ' + data.LastName,
									useremail: data.Email,
									password: randomPassword,
									logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
								 url: FRONTEND_URL,
								};
								// if(body.email){
								// 	await sendMail([body.email,'admin@lred.com'], 'Credentials', 'userCredentials', replacement);
								// }
							}
						}
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}

	const userList = await User.findAll({
		include: [{ model: LoginUser }, { model: Role, where: { name: 'Employee' } }],
	});
	for (const users of userList) {
		const employeeSegment = await EmployeeSegment.findAll({
			include: [{ model: Employee, where: { loginUserId: users.loginUserId, deletedAt: null } }],
		});
		for (const emp of employeeSegment) {
			if (emp.segmentId) {
				const isExistUserSegment = await UserSegment.findOne({
					where: { userId: users.id, segmentId: emp.segmentId, subSegmentId: emp.subSegmentId, deletedAt: null },
				});
				if (!isExistUserSegment) {
					await UserSegment.create({ userId: users.id, segmentId: emp.segmentId, subSegmentId: emp.subSegmentId });
				}
				const isExistUserSegmentApproval = await UserSegmentApproval.findOne({
					where: { userId: users.id, segmentId: emp.segmentId, subSegmentId: emp.subSegmentId, deletedAt: null },
				});
				if (!isExistUserSegmentApproval) {
					await UserSegmentApproval.create({
						userId: users.id,
						segmentId: emp.segmentId,
						subSegmentId: emp.subSegmentId,
					});
				}
			}
		}
	}
	console.log('info', '-------------------------End Employee Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
