import Client from '@/models/client.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import Rotation from '@/models/rotation.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';
const employeeRepo = new EmployeeRepo();

interface IEmployeeRotationData {
	EmployeeId: string;
	ExceptionType: number;
	StartDate: Date;
	EndDate: Date;
	SegmentId: string;
	SubSegmentId: string;
	RotationId: string;
	MonthlySalary: number | null;
	BaseSalary: number | null;
	DailyCost: number | null;
	WeekendRollover: boolean;
	BalanceRollover: boolean;
	ClientId: string;
	Name: string;
	WeeksOn: number;
	WeeksOff: number;
	Resident: number;
	Monday: boolean;
	Tuesday: boolean;
	Wednesday: boolean;
	Thursday: boolean;
	Friday: boolean;
	Saturday: boolean;
	Sunday: boolean;
	WeekendBonus: boolean;
	OvertimeBonus: boolean;
	SegmentName: string;
	SegmentCode: string;
	SegmentClientId: string;
	SubSegmentName: string;
	SubSegmentCode: string;
}

interface IRotationData {
	Id: string;
	ClientId: string;
	Name: string;
	WeeksOn: number | null;
	WeeksOff: number | null;
	Resident: number;
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
		'SELECT rd_EmployeeException.*,rd_Rotation.*,rd_Segment.Name as SegmentName,rd_Segment.Code as SegmentCode,rd_Segment.ClientId as SegmentClientId,rd_SubSegment.Name as SubSegmentName,rd_SubSegment.Code as SubSegmentCode FROM rd_EmployeeException LEFT JOIN rd_Rotation ON rd_Rotation.Id=rd_EmployeeException.RotationId LEFT JOIN rd_Segment ON rd_Segment.Id=rd_EmployeeException.SegmentId LEFT JOIN rd_SubSegment ON rd_SubSegment.Id=rd_EmployeeException.SubSegmentId',
	);
	console.log(
		'info',
		'------------------------- Start Employee Salary, Rotation and Segment Migration -------------------------',
	);
	if (result.length) {
		for (const data of result[0] as IEmployeeRotationData[]) {
			try {
				const isEmployeeExist = await employeeRepo.get({ where: { oldEmployeeId: data.EmployeeId, deletedAt: null } });
				if (isEmployeeExist) {
					if (data.ExceptionType === 1) {
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
						const employeeSegment = {
							employeeId: isEmployeeExist.id,
							segmentId: isExistSegment?.id || null,
							subSegmentId: isExistSubSegment?.id || null,
							date: moment(moment(data?.StartDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						};
						const isExistEmployeeSegment = await EmployeeSegment.findOne({ where: employeeSegment });
						!isExistEmployeeSegment && (await EmployeeSegment.create(employeeSegment));
					} else if (data.ExceptionType === 2) {
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
							Name: data.Name,
							WeeksOn: data.WeeksOn,
							WeeksOff: data.WeeksOff,
							OvertimeBonus: data.OvertimeBonus,
							WeekendBonus: data.WeekendBonus,
							Resident: data.Resident,
						});
						const isExistRotation = await Rotation.findOne({ where: { ...rotationData } });
						if (isExistRotation) {
							const employeeRotation = {
								employeeId: isEmployeeExist.id,
								rotationId: isExistRotation.id,
								date: moment(moment(data.StartDate ?? new Date()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
							};
							const isExistEmployeeRotation = await EmployeeRotation.findOne({ where: employeeRotation });
							!isExistEmployeeRotation && (await EmployeeRotation.create(employeeRotation));
						}
					} else if (data.ExceptionType === 3) {
						const employeeSalary = {
							baseSalary: Number(data?.BaseSalary ?? 0.0),
							monthlySalary: Number(data?.MonthlySalary ?? 0.0),
							dailyCost: Number(data?.DailyCost ?? 0.0),
							startDate: moment(data.StartDate ?? new Date()).toDate(),
							endDate: null,
							employeeId: isEmployeeExist?.id,
						};
						const isExistEmployeeSalary = await EmployeeSalary.findOne({ where: employeeSalary });
						!isExistEmployeeSalary && (await EmployeeSalary.create(employeeSalary));
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log(
		'info',
		'-------------------------End Employee Salary, Rotation and Segment Migration-------------------------',
	);
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
