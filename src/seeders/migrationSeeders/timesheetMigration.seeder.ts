import Client from '@/models/client.model';
import LoginUser from '@/models/loginUser.model';
import Timesheet from '@/models/timesheet.model';
import User from '@/models/user.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import SegmentRepo from '@/repository/segment.repository';
import SubSegmentRepo from '@/repository/subSegment.repository';
import { parse } from '@/utils/common.util';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();
const segmentRepo = new SegmentRepo();
const subSegmentRepo = new SubSegmentRepo();

const insertArray = [];
const employeesArr = new Map();
const segmentArr = new Map();
const userArr = new Map();
const subSegmentArr = new Map();
const notfound = [];
const errorArray = [];
let missedCount = 0;

const dataInserter = async (insertData) => {
	for (const insertArr of insertData[0] as any[]) {
		if (!employeesArr.get(insertArr.eid)) {
			const empData = await employeeRepo
				.get({ attributes: ['id', 'clientId', 'startDate'], where: { oldEmployeeId: insertArr.eid } })
				.then((parserData) => parse(parserData));
			let getClientId = null;

			if (!segmentArr.get(insertArr.segid)) {
				if (!empData) {
					if (insertArr.segmentClientId) {
						getClientId = await Client.findOne({ where: { oldClientId: insertArr.segmentClientId } });
					}
				}
				const segmentData = await segmentRepo
					.get({
						attributes: ['id'],
						where: {
							code: insertArr.segmentCode,
							name: insertArr.segmentName,
							clientId: empData ? empData.clientId : getClientId.id,
						},
					})
					.then((parserData) => parse(parserData));
				segmentArr.set(insertArr.segid, segmentData);
			}
			if (!subSegmentArr.get(insertArr.subsegid) && insertArr.subsegid) {
				const subSegmentData = await subSegmentRepo
					.get({
						attributes: ['id'],
						where: {
							code: insertArr.subSegmentCode,
							name: insertArr.subSegmentName,
							segmentId: segmentArr.get(insertArr.segid).id,
						},
					})
					.then((parserData) => parse(parserData));
				subSegmentArr.set(insertArr.subsegid, subSegmentData);
			}
			employeesArr.set(insertArr.eid, empData);
		}
		if (insertArr.ApprovedUserName && !userArr.get(insertArr.ApprovedUserName)) {
			const userData = await User.findOne({
				include: [{ model: LoginUser, required: true, where: { email: insertArr.ApprovedUserName } }],
			});
			userArr.set(insertArr.ApprovedUserName, userData);
		}

		if (insertArr.UnapprovedUserName && !userArr.get(insertArr.UnapprovedUserName)) {
			const userData = await User.findOne({
				include: [{ model: LoginUser, required: true, where: { email: insertArr.UnapprovedUserName } }],
			});
			userArr.set(insertArr.UnapprovedUserName, userData);
		}

		if (!employeesArr.get(insertArr.eid)) {
			const empData = await employeeRepo
				.get({ attributes: ['id', 'clientId'], where: { oldEmployeeId: insertArr.eid } })
				.then((parserData) => parse(parserData));
			if (empData) {
				employeesArr.set(insertArr.eid, empData);
			}
		}
		if (employeesArr.get(insertArr.eid)?.id) {
			try {
				if (moment(insertArr.StartDate, 'YYYY-MM-DD').isSameOrAfter(moment(employeesArr.get(insertArr.eid).startDate)))
					insertArray.push({
						startDate: moment(insertArr.StartDate, 'YYYY-MM-DD').toDate(),
						endDate: moment(insertArr.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'days').toDate(),
						segmentId: segmentArr.get(insertArr.segid).id,
						subSegmentId: subSegmentArr.get(insertArr.subsegid)?.id || null,
						employeeId: employeesArr.get(insertArr.eid).id,
						clientId: employeesArr.get(insertArr.eid).clientId,
						dbKey: `${moment(insertArr.StartDate, 'YYYY-MM-DD').format('DDMMYYYY')}${
							segmentArr.get(insertArr.segid).id
						}${subSegmentArr.get(insertArr.subsegid)?.id || ''}${employeesArr.get(insertArr.eid).id}`,
						deletedAt: null,
						status: insertArr.StatusId == 2 ? 'APPROVED' : 'UNAPPROVED',
						oldTimesheetId: insertArr.timesheetId,
						approvedAt: insertArr.ApprovedDate ? moment(insertArr.ApprovedDate).toDate() : null,
						approvedBy: insertArr.ApprovedUserName ? userArr.get(insertArr.ApprovedUserName).id : null,
						unApprovedAt: insertArr.UnapprovedDate ? moment(insertArr.UnapprovedDate).toDate() : null,
						unApprovedBy: insertArr.UnapprovedUserName ? userArr.get(insertArr.UnapprovedUserName).id : null,
						updatedBy: null,
					});
				await Timesheet.create({
					startDate: moment(insertArr.StartDate, 'YYYY-MM-DD').toDate(),
					endDate: moment(insertArr.StartDate, 'YYYY-MM-DD').add(1, 'month').subtract(1, 'days').toDate(),
					segmentId: segmentArr.get(insertArr.segid).id,
					subSegmentId: subSegmentArr.get(insertArr.subsegid)?.id || null,
					employeeId: employeesArr.get(insertArr.eid).id,
					clientId: employeesArr.get(insertArr.eid).clientId,
					dbKey: `${moment(insertArr.StartDate, 'YYYY-MM-DD').format('DDMMYYYY')}${segmentArr.get(insertArr.segid).id}${
						subSegmentArr.get(insertArr.subsegid)?.id || ''
					}${employeesArr.get(insertArr.eid).id}`,
					deletedAt: null,
					status: insertArr.StatusId == 2 ? 'APPROVED' : 'UNAPPROVED',
					oldTimesheetId: insertArr.timesheetId,
					approvedAt: insertArr.ApprovedDate ? moment(insertArr.ApprovedDate).toDate() : null,
					approvedBy: insertArr.ApprovedUserName ? userArr.get(insertArr.ApprovedUserName).id : null,
					unApprovedAt: insertArr.UnapprovedDate ? moment(insertArr.UnapprovedDate).toDate() : null,
					unApprovedBy: insertArr.UnapprovedUserName ? userArr.get(insertArr.UnapprovedUserName).id : null,
					updatedBy: null,
				});
			} catch (error) {
				errorArray.push(error);
			}
		} else {
			missedCount++;
			if (!notfound.includes(insertArr.eid)) {
				notfound.push(insertArr.eid);
			}
		}
	}
};

(async function injectTimesheet() {
	console.info('info', '------------------------- Start Timesheet Migration -------------------------');

	const timesheetDataByEmployee = await mssqldb.query(`
		select
		rt.id AS timesheetId,
		rt.StartDate,
		rte.EmployeeId  AS eid,
		rt.SegmentId AS segid,
		rt.ApprovedDate, rt.ApprovedUserName, rt.UnapprovedUserName, rt.UnapprovedDate,
		rs.Code AS segmentCode,
		rs.Name AS segmentName,
		rt.SubSegmentId AS subsegid,
		rss.Code AS subSegmentCode,
		rss.Name AS subSegmentName,
		rt.StatusId, rs.ClientId as segmentClientId
		from rd_Timesheet rt
		left join rd_TimesheetEmployee rte on rte.TimesheetId = rt.Id
		left JOIN rd_Segment rs on rs.id = rt.SegmentId
		left JOIN rd_SubSegment rss on rss.id = rt.SubSegmentId
	`);
	const timesheetDataByBonus = await mssqldb.query(`
	select
		rt.id AS timesheetId, 
		rt.StartDate,
		rtb.EmployeeId  AS eid,
		rt.SegmentId AS segid,
		rt.ApprovedDate, rt.ApprovedUserName, rt.UnapprovedUserName, rt.UnapprovedDate,
		rs.Code AS segmentCode,
		rs.Name AS segmentName,
		rt.SubSegmentId AS subsegid,
		rss.Code AS subSegmentCode, 
		rss.Name AS subSegmentName, 
		rt.StatusId, rs.ClientId as segmentClientId
		from rd_Timesheet rt 
		left join rd_TimesheetBonus rtb on rtb.TimesheetId = rt.Id
		left JOIN rd_Segment rs on rs.id = rt.SegmentId
		left JOIN rd_SubSegment rss on rss.id = rt.SubSegmentId
	`);
	await dataInserter(timesheetDataByEmployee);
	await dataInserter(timesheetDataByBonus);
	console.log('errorArray', JSON.stringify(errorArray));
	console.log({ missedCount });
	console.log('insertArray', insertArray?.length);
	console.log('errorArray', errorArray?.length);
	console.log('notfound', notfound, notfound?.length);
	// End Client Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
