import { messageStatus } from '@/interfaces/model/message.interface';
import LoginUser from '@/models/loginUser.model';
import Message from '@/models/message.model';
import MessageDetail from '@/models/messageDetail.model';
import mssqldb from '@/mssqldb';
import ClientRepo from '@/repository/client.repository';
import EmployeeRepo from '@/repository/employee.repository';
import MessageRepo from '@/repository/message.repository';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';

const userRepo = new UserRepo();
const clientRepo = new ClientRepo();
const employeeRepo = new EmployeeRepo();
const messageRepo = new MessageRepo();

(async function injectMessage() {
	console.info('info', '------------------------- Start Message Migration -------------------------');

	const result = await mssqldb.query(
		'SELECT rd_Message.*, rd_MessageEmployee.EmployeeId, rd_MessageEmployee.Status as Status,rd_MessageEmployee.MessageId as MessageId,rd_MessageEmployee.ErrorMessage FROM rd_MessageEmployee LEFT join rd_Message ON rd_Message.Id=rd_MessageEmployee.MessageId',
	);

	const userArr = new Map();
	const messageArr = new Map();
	const clientArr = new Map();
	const empArr = new Map();

	if (result.length) {
		for (const data of result[0] as any) {
			if (data.UserName && !userArr.get(data.UserName)) {
				const userData = await userRepo
					.get({
						include: [{ model: LoginUser, required: true, where: { email: data.UserName } }],
					})
					.then((parserData) => parse(parserData));
				userArr.set(data.UserName, userData);
			}

			if (data.ClientId && !clientArr.get(data.ClientId)) {
				const clientData = await clientRepo.get({
					where: { oldClientId: data.ClientId, deletedAt: null },
				});
				clientArr.set(data.ClientId, clientData);
			}

			const res = await Message.create({
				clientId: data.ClientId ? clientArr.get(data.ClientId).id : 0,
				isSchedule: false,
				scheduleDate: null,
				errorMessage: data.ErrorMessage ? data.ErrorMessage : null,
				message: data.Text,
				updatedBy: null,
				updatedAt: null,
				createdAt: data.CreatedDate,
				status:
					data.Status == 1
						? messageStatus.DRAFT
						: data.Status == 2
						? messageStatus.SENT
						: data.Status == 3
						? messageStatus.ERROR
						: messageStatus.DRAFT,
				createdBy: data.UserName ? userArr.get(data.UserName).id : null,
			});

			if (data.EmployeeId && !empArr.get(data.EmployeeId)) {
				const empData = await employeeRepo
					.get({ attributes: ['id', 'clientId', 'startDate'], where: { oldEmployeeId: data.EmployeeId } })
					.then((parserData) => parse(parserData));
				empArr.set(data.EmployeeId, empData);
			}

			if (data.MessageId && !messageArr.get(data.MessageId)) {
				const messageData = await messageRepo.get({ where: { id: res.id } }).then((parserData) => parse(parserData));
				messageArr.set(data.MessageId, messageData);
			}
			await MessageDetail.create({
				messageId: data.MessageId ? messageArr.get(data.MessageId).id : null,
				employeeId: data.EmployeeId ? empArr.get(data.EmployeeId).id : null,
				managerUserId: null,
				segmentId: null,
			});
		}
	}
	console.info('info', '-------------------------End Message Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
