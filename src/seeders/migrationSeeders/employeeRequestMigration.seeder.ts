import { requestStatus } from '@/interfaces/model/request.document.interface';
import { collectionDelivery, status } from '@/interfaces/model/request.interface';
import Client from '@/models/client.model';
import EmployeeContract from '@/models/employeeContract.model';
import LoginUser from '@/models/loginUser.model';
import RequestDocument from '@/models/request.document.model';
import Request from '@/models/request.model';
import RequestType from '@/models/requestType.model';
import User from '@/models/user.model';
import mssqldb from '@/mssqldb';
import EmployeeRepo from '@/repository/employee.repository';
import moment from 'moment';

const employeeRepo = new EmployeeRepo();

interface IEmployeeRequest {
	Id: string;
	Name: string;
	ContractNumber: string;
	MobileNumber: string;
	Email: string | null;
	EmployeeId: string | null;
	CreatedDate: Date;
	ReviewDate: Date | null;
	ReviewedBy: string | null;
	StatusId: number;
	DeliveryType: number;
	DeliveryDate: string | null;
	EmailDelivery: boolean;
	PreparedInfo: string;
	PreparedBy: string | null;
	PreparedDate: Date | null;
	ClientId: string | null;
	ClientName: string | null;
}

interface IRequestDocumentData {
	Id: string;
	RequestId: string;
	RequestTypeId: string;
	OtherInfo: string;
	CompletedBy: string | null;
	CompletedDate: Date | null;
	Completed: boolean;
	Name: string;
}

(async function injectEmployeeRequest() {
	const result = await mssqldb.query(
		'SELECT rd_Request.*,rd_Employee.ClientId,rd_Client.Name as ClientName FROM rd_Request LEFT JOIN rd_Employee ON rd_Employee.Id=rd_Request.EmployeeId LEFT JOIN rd_Client ON rd_Client.Id=rd_Employee.ClientId',
	);
	console.log(
		'info',
		'------------------------- Start Employee Request And Document Migration -------------------------',
	);
	if (result.length) {
		for (const data of result[0] as IEmployeeRequest[]) {
			try {
				const contractData = await EmployeeContract.findOne({
					where: { newContractNumber: data.ContractNumber, deletedAt: null },
				});

				const resultRequestDocument = await mssqldb.query(
					`SELECT rd_RequestDocument.*,rd_RequestType.Name FROM rd_RequestDocument INNER JOIN rd_RequestType ON rd_RequestType.Id=rd_RequestDocument.RequestTypeId WHERE rd_RequestDocument.RequestId='${data.Id}'`,
				);

				const employeeRequest = {
					clientId: null,
					employeeId: null,
					contractId: contractData ? contractData.id : null,
					name: data.Name,
					contractNumber: data.ContractNumber,
					mobileNumber: data.MobileNumber,
					email: data.Email || '',
					collectionDelivery: data.DeliveryType ? collectionDelivery.DELIVERY : collectionDelivery.COLLECTION,
					deliveryDate: data.DeliveryDate ? moment(data.DeliveryDate).toDate() : null,
					documentTotal: resultRequestDocument.length ? resultRequestDocument[0].length : 0,
					createdAt: data.CreatedDate ? moment(data.CreatedDate).toDate() : null,
					emailDocuments: false,
					status:
						data.StatusId == 0
							? status.NEW
							: data.StatusId == 1
							? status.STARTED
							: data.StatusId == 2
							? status.DECLINED
							: status.COMPLETED,
					reviewedDate: null,
					reviewedBy: null,
				};

				if ((data.ClientId, data.EmployeeId)) {
					const employeeClientData = await employeeRepo.get({
						where: { oldEmployeeId: data.EmployeeId, deletedAt: null },
						include: [{ model: Client, where: { oldClientId: data.ClientId, deletedAt: null } }],
					});
					if (employeeClientData) {
						employeeRequest.employeeId = employeeClientData?.id;
						employeeRequest.clientId = employeeClientData.clientId;
					}
				}

				if (data.ReviewedBy) {
					employeeRequest.reviewedDate = data.ReviewDate ? moment(data.ReviewDate).toDate() : null;
					const userData = await User.findOne({
						where: { deletedAt: null },
						include: [{ model: LoginUser, where: { email: data.ReviewedBy } }],
					});
					if (userData) employeeRequest.reviewedBy = userData.id;
				}
				const requestId = await Request.create(employeeRequest);
				for (const rDocument of resultRequestDocument[0] as IRequestDocumentData[]) {
					const requestTypeData = await RequestType.findOne({ where: { name: rDocument.Name, deletedAt: null } });

					if (requestTypeData) {
						const reqDocumentData = {
							requestId: requestId.id,
							documentType: requestTypeData.id,
							otherInfo: rDocument.OtherInfo || '',
							completedBy: null,
							completedDate: rDocument.CompletedDate ? moment(rDocument.CompletedDate).toDate() : null,
							status: rDocument.Completed ? requestStatus.ACTIVE : null,
						};
						const userData = rDocument.CompletedBy
							? await User.findOne({
									where: { deletedAt: null },
									include: [{ model: LoginUser, where: { email: rDocument.CompletedBy } }],
							  })
							: null;
						if (userData) {
							reqDocumentData.completedBy = userData.id;
						}
						await RequestDocument.create(reqDocumentData);
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Employee Request And Document Migration-------------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
