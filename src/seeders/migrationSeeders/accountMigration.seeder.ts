import { AccountAttributes } from '@/interfaces/model/account.interface';
import Account from '@/models/account.model';
import BonusType from '@/models/bonusType.model';
import Employee from '@/models/employee.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import TimesheetRepo from '@/repository/timesheet.repository';
import TimesheetScheduleRepo from '@/repository/timesheetSchedule.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';

const timesheetRepo = new TimesheetRepo();
const employeeRepo = new EmployeeRepo();
const timesheetScheduleRepo = new TimesheetScheduleRepo();

interface accountSalaryDataInterface {
	timesheetId: string | null;
	StartDate: string | null;
	employeeId: string | null;
	EmployeeNumber: string | null;
	ClientId: string | null;
	FirstName: string | null;
	LastName: string | null;
	MonthlySalary: number | null;
	segmentName: string | null;
	subSegmentName: string | null;
	Invoiced: number | null;
	PONumber: string | null;
	PODate: Date | null;
	InvoiceNumber: string | null;
	InvoiceLodgingDate: Date | null;
	InvoiceAmount: number | null;
	SalaryPaid: number | null;
	Bonus1: number | null;
	POBonus1: string | null;
	InvoiceNumberPOBonus1: string | null;
	Bonus2: number | null;
	POBonus2: string | null;
	InvoiceNumberPOBonus2: string | null;
	SalaryPaidDate: Date | null;
	Comments: string | null;
	DailyCost: number | null;
}

interface accountBonusDataInterface {
	timesheetId: string | null;
	StartDate: string | null;
	employeeId: string | null;
	EmployeeNumber: string | null;
	ClientId: string | null;
	FirstName: string | null;
	LastName: string | null;
	MonthlySalary: 240000;
	segmentName: string | null;
	subSegmentName: string | null;
	Invoiced: number | null;
	PONumber: string | null;
	PODate: Date | null;
	InvoiceNumber: string | null;
	InvoiceLodgingDate: Date | null;
	InvoiceAmount: number | null;
	Comments: string | null;
	bonusType: string | null;
	DailyCost: number | null;
	daysWorked: number | null;
}

(async function injectAccountPO() {
	console.info('info', '------------------------- Start Account Migration -------------------------');
	const accountSalaryData = await mssqldb.query(`
  SELECT 
  rt.Id as timesheetId,
  rt.StartDate ,
  re.Id as employeeId,
  re.EmployeeNumber,
  re.ClientId,
  re.FirstName,
	re.LastName,
  re.MonthlySalary,
	re.DailyCost,
  rs.Name as segmentName,
  rss.name as subSegmentName,
  rte.Invoiced,
  rte.PONumber ,
  rte.PODate ,
  rte.InvoiceNumber ,
  rte.InvoiceLodgingDate ,
  rte.InvoiceAmount ,
  rte.SalaryPaid ,
  rte.Bonus1 ,
  rte.POBonus1 ,
  rte.InvoiceNumberPOBonus1 ,
  rte.Bonus2 ,
  rte.POBonus2 ,
  rte.InvoiceNumberPOBonus2 ,
  rte.SalaryPaidDate  ,
  rte.Comments
  from rd_Timesheet rt 
  RIGHT JOIN rd_TimesheetEmployee rte ON rte.TimesheetId = rt.Id
  LEFT JOIN rd_Employee re ON rte.EmployeeId  = re.Id
  LEFT JOIN rd_Segment rs ON rt.SegmentId= rs.Id
  LEFT JOIN rd_SubSegment rss ON rt.SubSegmentId= rss.Id
  ORDER BY timesheetId ASC;`);

	const accountBonusData = await mssqldb.query(`
	SELECT
	rt.Id as timesheetId,
	rt.StartDate ,
	re.Id as employeeId,
	re.EmployeeNumber,
	re.ClientId,
	re.FirstName,
	re.LastName,
	re.MonthlySalary,
	re.DailyCost,
	rs.Name as segmentName,
	rss.name as subSegmentName,
	rtb.Invoiced,
	rtb.PONumber,
	rtb.PODate,
	rtb.InvoiceNumber,
	rtb.InvoiceLodgingDate,
	rtb.InvoiceAmount,
	rtb.Comments,
	rbt.Code as bonusType,
	rtb.BonusTypeId
	 from rd_Timesheet rt
	 RIGHT JOIN rd_TimesheetBonus rtb ON rtb.TimesheetId = rt.Id
	 LEFT JOIN rd_Employee re ON rtb.EmployeeId = re.Id
	 LEFT JOIN rd_Segment rs ON rt.SegmentId= rs.Id
	 LEFT JOIN rd_SubSegment rss ON rt.SubSegmentId= rss.Id
	 LEFT JOIN rd_BonusType rbt ON rtb.BonusTypeId = rbt.Id
	 ORDER BY timesheetId ASC;`);

	const accountData = [];

	const errorArray = [];
	const eids = [];
	const employeesArr = new Map();
	const clientArr = new Map();
	const timesheetArr = new Map();
	const getEmpTimesheetDetail = async (bonusData) => {
		if (!employeesArr.get(bonusData.employeeId)) {
			const empData = await employeeRepo
				.get({ attributes: ['id', 'clientId'], where: { oldEmployeeId: bonusData.employeeId } })
				.then((parserData) => parse(parserData));
			employeesArr.set(bonusData.employeeId, empData.id);
			if (!clientArr.get(bonusData.ClientId)) {
				clientArr.set(bonusData.ClientId, empData.clientId);
			}
		}
		if (!timesheetArr.get(`${bonusData.timesheetId}${bonusData.employeeId}`)) {
			const timesheetData = await timesheetRepo
				.get({
					attributes: ['id'],
					where: { oldTimesheetId: bonusData.timesheetId, employeeId: employeesArr.get(bonusData.employeeId) },
				})
				.then((parserData) => parse(parserData));
			if (timesheetData?.id) {
				timesheetArr.set(`${bonusData.timesheetId}${bonusData.employeeId}`, timesheetData.id);
			}
		}
	};
	const generateBonus = async (
		bonusData: accountBonusDataInterface,
		bonusCount: number,
		monthlySalary: number,
		dailyCost: number,
	) => {
		try {
			const affectation =
				(bonusData?.segmentName ? bonusData?.segmentName : '-') +
				(bonusData?.subSegmentName ? `-${bonusData?.subSegmentName}` : '');
			const serviceMonth = bonusData?.StartDate
				? moment(bonusData?.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'day').format('MMM-YYYY')
				: '';
			const shouldBeInvoiced = bonusCount * dailyCost;
			const invoiced = bonusData?.Invoiced ?? null;
			const toBeInvoicedBack = (invoiced && shouldBeInvoiced && invoiced - shouldBeInvoiced) ?? null;
			await getEmpTimesheetDetail(bonusData);
			let bonusPrintName = bonusData?.bonusType;
			if (bonusData?.bonusType) {
				const filteredBonusData = await BonusType.findOne({
					paranoid: false,
					where: {
						code: bonusData?.bonusType,
					},
					attributes: ['timesheetName', 'code'],
				});
				if (filteredBonusData && filteredBonusData?.timesheetName) {
					bonusPrintName = filteredBonusData?.timesheetName;
				}
			}
			const bonusObj = {
				clientId: clientArr.get(bonusData?.ClientId),
				timesheetId: timesheetArr.get(`${bonusData?.timesheetId}${bonusData?.employeeId}`),
				employeeId: employeesArr.get(bonusData?.employeeId),
				n: bonusData?.EmployeeNumber,
				position: `${bonusData?.LastName} ${bonusData?.FirstName}`,
				type: bonusPrintName,
				affectation: affectation,
				serviceMonth: serviceMonth,
				monthlySalaryWithHousingAndTravel: monthlySalary,
				daysWorked: bonusCount,
				dailyCost: dailyCost,
				shouldBeInvoiced: shouldBeInvoiced,
				invoiced: invoiced,
				toBeInvoicedBack: toBeInvoicedBack,
				poNumber: bonusData?.PONumber ?? null,
				poDate: bonusData?.PODate ?? null,
				invoiceNumber: bonusData?.InvoiceNumber ?? null,
				invoiceLodgingDate: bonusData?.InvoiceLodgingDate ?? null,
				invoiceAmount: bonusData?.InvoiceAmount ?? null,
				comments: bonusData?.Comments ?? null,
			};
			accountData.push(bonusObj);
			let result = await Account.create(bonusObj);
			result = parse(result);
			console.log(result);
			return result;
		} catch (error) {
			console.error({ error });
			errorArray.push(error);
		}
	};
	for (const salaryData of accountSalaryData[0] as accountSalaryDataInterface[]) {
		try {
			const affectation =
				(salaryData?.segmentName ? salaryData?.segmentName : '-') +
				(salaryData?.subSegmentName ? `-${salaryData?.subSegmentName}` : '');
			const serviceMonth = salaryData?.StartDate
				? moment(salaryData?.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'day').format('MMM-YYYY')
				: '';
			let timesheetSalaryTotal = 0;
			let monthlySalary = salaryData?.MonthlySalary ?? 0;
			let dailyCost = salaryData?.DailyCost ?? 0;
			if (employeesArr.get(salaryData?.employeeId)) {
				timesheetSalaryTotal = await timesheetScheduleRepo.getCount({
					where: {
						date: {
							[Op.between]: [
								moment(salaryData?.StartDate).toDate(),
								moment(salaryData?.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'day').toDate(),
							],
						},
						[Op.or]: [{ status: 'P' }, { status: 'CR' }],
						employeeId: employeesArr.get(salaryData?.employeeId),
					},
				});
				const emplyeeSalaryHistory = await EmployeeSalary.findAll({
					where: {
						employeeId: employeesArr.get(salaryData?.employeeId),
						startDate: {
							[Op.lte]: salaryData?.StartDate,
						},
					},
					order: [['startDate', 'DESC']],
					limit: 1,
				});
				if (emplyeeSalaryHistory?.length > 0) {
					monthlySalary = emplyeeSalaryHistory?.[0]?.monthlySalary ?? 0;
					dailyCost = emplyeeSalaryHistory?.[0]?.dailyCost ?? 0;
				}
			}
			const shouldBeInvoiced = dailyCost * timesheetSalaryTotal;
			const invoiced = salaryData?.Invoiced ?? null;
			const toBeInvoicedBack = (invoiced && shouldBeInvoiced && invoiced - shouldBeInvoiced) ?? null;
			await getEmpTimesheetDetail(salaryData);
			const finalAccountSalaryData: AccountAttributes = {
				clientId: clientArr.get(salaryData?.ClientId),
				timesheetId: timesheetArr.get(`${salaryData?.timesheetId}${salaryData?.employeeId}`),
				employeeId: employeesArr.get(salaryData?.employeeId),
				n: salaryData?.EmployeeNumber,
				position: `${salaryData?.LastName} ${salaryData?.FirstName}`,
				type: 'Salary',
				affectation: affectation,
				serviceMonth: serviceMonth,
				monthlySalaryWithHousingAndTravel: monthlySalary,
				daysWorked: timesheetSalaryTotal,
				dailyCost: dailyCost,
				shouldBeInvoiced: shouldBeInvoiced,
				invoiced: invoiced,
				toBeInvoicedBack: toBeInvoicedBack,
				poNumber: salaryData?.PONumber ?? null,
				poDate: salaryData?.PODate ?? null,
				invoiceNumber: salaryData?.InvoiceNumber ?? null,
				invoiceLodgingDate: salaryData?.InvoiceLodgingDate ?? null,
				invoiceAmount: salaryData?.InvoiceAmount ?? null,
				salaryPaid: salaryData?.SalaryPaid ?? null,
				bonus1: salaryData?.Bonus1 ?? null,
				poBonus1: +salaryData?.POBonus1 ?? null,
				invoiceNumberPOBonus1: salaryData?.InvoiceNumberPOBonus1 ?? null,
				bonus2: salaryData?.Bonus2 ?? null,
				poBonus2: +salaryData?.POBonus2 ?? null,
				invoiceNumberPOBonus2: salaryData?.InvoiceNumberPOBonus2 ?? null,
				dateSalaryPaid: salaryData?.SalaryPaidDate ?? null,
				comments: salaryData?.Comments ?? null,
				isGeneratedInvoice: false,
			};
			accountData?.push(finalAccountSalaryData);
			let result = await Account.create(finalAccountSalaryData);
			result = parse(result);
			console.log(result);
		} catch (error) {
			console.error({ error });
			errorArray.push(error);
		}

		const resp = accountBonusData[0]?.filter((data: accountBonusDataInterface) => {
			return data?.timesheetId === salaryData?.timesheetId && data?.employeeId === salaryData?.employeeId;
		});
		for (const bonusData of resp as accountBonusDataInterface[]) {
			if (!eids.includes(`${salaryData.employeeId}${salaryData.timesheetId}`)) {
				eids.push(`${salaryData.employeeId}${salaryData.timesheetId}`);
			}
			let timesheetBonusTotal = 0;
			let monthlySalary = 0;
			let dailyCost = 0;
			if (employeesArr.get(bonusData?.employeeId)) {
				timesheetBonusTotal = await timesheetScheduleRepo.getCount({
					where: {
						date: {
							[Op.between]: [
								moment(bonusData?.StartDate).toDate(),
								moment(bonusData?.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'day').toDate(),
							],
						},
						bonusCode: bonusData?.bonusType,
						employeeId: employeesArr.get(bonusData?.employeeId),
					},
				});
				const employeeBonusData = await Employee.findOne({
					where: {
						id: employeesArr.get(bonusData?.employeeId),
					},
					attributes: ['id', 'customBonus'],
				});
				if (employeeBonusData) {
					let customBonus = JSON.parse(employeeBonusData?.customBonus);
					if (customBonus) {
						customBonus = customBonus?.data;
						const isExistingCustomBonus = customBonus?.findIndex(
							(customBonusIndex) => customBonusIndex.label === bonusData?.bonusType,
						);
						if (isExistingCustomBonus >= 0) {
							monthlySalary = Number(Number(customBonus[isExistingCustomBonus]?.price)?.toFixed(2));
							dailyCost = Number(Number(customBonus[isExistingCustomBonus]?.coutJournalier)?.toFixed(2));
						}
					}
				}
			}
			bonusData['daysWorked'] = timesheetBonusTotal;
			await generateBonus(bonusData, timesheetBonusTotal, monthlySalary, dailyCost);
		}
	}
	const resp = accountBonusData[0]?.filter((data: accountBonusDataInterface) => {
		return !eids.includes(`${data.employeeId}${data?.timesheetId}`);
	});
	for (const bonusData of resp as accountBonusDataInterface[]) {
		let timesheetBonusTotal = 0;
		let monthlySalary = 0;
		let dailyCost = 0;
		if (employeesArr.get(bonusData?.employeeId)) {
			timesheetBonusTotal = await timesheetScheduleRepo.getCount({
				where: {
					date: {
						[Op.between]: [
							moment(bonusData?.StartDate).toDate(),
							moment(bonusData?.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'day').toDate(),
						],
					},
					bonusCode: bonusData?.bonusType,
					employeeId: employeesArr.get(bonusData?.employeeId),
				},
			});
			const employeeBonusData = await Employee.findOne({
				where: {
					id: employeesArr.get(bonusData?.employeeId),
				},
				attributes: ['id', 'customBonus'],
			});
			if (employeeBonusData) {
				let customBonus = JSON.parse(employeeBonusData?.customBonus);
				if (customBonus) {
					customBonus = customBonus?.data;
					const isExistingCustomBonus = customBonus?.findIndex(
						(customBonusIndex) => customBonusIndex.label === bonusData?.bonusType,
					);
					if (isExistingCustomBonus >= 0) {
						monthlySalary = Number(Number(customBonus[isExistingCustomBonus]?.price)?.toFixed(2));
						dailyCost = Number(Number(customBonus[isExistingCustomBonus]?.coutJournalier)?.toFixed(2));
					}
				}
			}
		}
		bonusData['daysWorked'] = timesheetBonusTotal;
		await generateBonus(bonusData, timesheetBonusTotal, monthlySalary, dailyCost);
	}
	console.log('errorArray', JSON.stringify(errorArray), errorArray?.length);

	console.info('info', '------------------------- End Account Migration -------------------------');
})().catch((err) => {
	console.log('error', err.message);
});
