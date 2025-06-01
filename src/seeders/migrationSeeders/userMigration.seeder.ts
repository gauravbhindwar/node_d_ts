import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { status } from '@/interfaces/model/user.interface';
import Client from '@/models/client.model';
import Feature from '@/models/feature.model';
import LoginUser from '@/models/loginUser.model';
import Permission from '@/models/permission.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import User from '@/models/user.model';
import UserClient from '@/models/userClient.model';
import UserPermission from '@/models/userPermission.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import mssqldb from '@/mssqldb';
import RoleRepo from '@/repository/role.repository';
import { generateUniquePassword } from '@/utils/common.util';

const roleList = [
	{
		roleName: 'Admin',
		permissions: [
			{
				feature: FeaturesNameEnum.ApproveDeletedFile,
				permission: [PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Create],
			},
			{
				feature: FeaturesNameEnum.BonusType,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Client,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Contact,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ErrorLogs,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Folder,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ImportLog,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Salary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.MedicalType,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Message,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.SalaryMessage,
				permission: [PermissionEnum.Update, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatAdjustment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculationV2,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatPayment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.RequestType,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Role,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Rotation,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Segment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.SubSegment,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Approve],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Users,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.View, PermissionEnum.Delete],
			},
		],
	},
	{
		roleName: 'Portal',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminViewer',
		permissions: [
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'TimesheetPreparation',
		permissions: [
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeLeave,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.MedicalRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View, PermissionEnum.Create, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminEmployee',
		permissions: [
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminContracts',
		permissions: [
			{
				feature: FeaturesNameEnum.ContractTemplate,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ContractTemplateVersion,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.Create, PermissionEnum.Update, PermissionEnum.Delete, PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Accounts',
		permissions: [
			{
				feature: FeaturesNameEnum.Account,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.AccountPO,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'AdminTransport',
		permissions: [
			{
				feature: FeaturesNameEnum.TransportDriver,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportDriverDocument,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportRequestVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportSummary,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportVehicle,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
			{
				feature: FeaturesNameEnum.TransportVehicleDocument,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
		],
	},
	{
		roleName: 'TimesheetApproval',
		permissions: [
			{
				feature: FeaturesNameEnum.Timesheet,
				permission: [PermissionEnum.View, PermissionEnum.Approve],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
		],
	},
	{
		roleName: 'Transport',
		permissions: [
			{
				feature: FeaturesNameEnum.TransportRequest,
				permission: [PermissionEnum.Create, PermissionEnum.View, PermissionEnum.Delete, PermissionEnum.Update],
			},
		],
	},
	{
		roleName: 'User',
		permissions: [
			{
				feature: FeaturesNameEnum.Dashboard,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Employee,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeFile,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.TimesheetSummary,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.EmployeeContract,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.ReliquatCalculation,
				permission: [PermissionEnum.View],
			},
			{
				feature: FeaturesNameEnum.Request,
				permission: [PermissionEnum.Create, PermissionEnum.View],
			},
		],
	},
];
const roleRepo = new RoleRepo();

interface IUserData {
	Id: string;
	ClientId: string;
	SegmentId: string;
	SubSegmentId: string;
	EmployeeId: string;
	Email: string | null;
	PhoneNumber: string;
	UserName: string;
	TimeZoneId: string | null;
	Name: string | null;
	SendEmailNotifications: boolean;
}

interface IRoleData {
	Id: string;
	Name: string;
}

interface IUserClientData {
	UserName: string;
	ClientId: string;
}

interface IUserSegmentData {
	SegmentName: string;
	SegmentCode: string;
	SegmentClientId: string;
	SubSegmentName: string;
	SubSegmentCode: string;
	SCode: string;
	SName: string;
	SClientId: string;
}

(async function injectFolder() {
	// Start User Migration
	const userPermission = new Map();
	const userRoleMap = new Map();
	const result = await mssqldb.query('SELECT * FROM AspNetUsers');
	console.log('info', '--------------------Start User Migration--------------------');
	if (result.length) {
		const userRole = await roleRepo.get({ where: { name: 'manager', deletedAt: null } });
		for (const data of result[0] as IUserData[]) {
			try {
				let UserId = null;
				let LoginUserId = null;
				const isLoginUserExist = await LoginUser.findOne({ where: { email: data.Email, deletedAt: null } });

				if (!isLoginUserExist) {
					const password = generateUniquePassword();
					const loginUserData = {
						email: data.Email,
						name: data.Name,
						timezone: data.TimeZoneId,
						isMailNotification: data.SendEmailNotifications,
						randomPassword: password,
						uniqueLoginId: null,
						code: password,
					};
					const loginUser = await LoginUser.create(loginUserData);
					LoginUserId = loginUser.id;
				} else {
					LoginUserId = isLoginUserExist.id;
				}

				if (LoginUserId && userRole && !isLoginUserExist) {
					const isUserExist = await User.findOne({ where: { loginUserId: LoginUserId, deletedAt: null } });
					if (!isUserExist) {
						const userData = {
							loginUserId: LoginUserId,
							roleId: userRole.id,
							status: status.ACTIVE,
						};
						const user = await User.create(userData);
						UserId = user.id;
						if (data.Id) {
							const resultUserRole = await mssqldb.query(
								`SELECT AspNetUserRoles.*,AspNetRoles.Name FROM AspNetUserRoles INNER JOIN AspNetRoles ON AspNetRoles.Id=AspNetUserRoles.RoleId where UserId='${data.Id}'`,
							);
							if (resultUserRole.length) {
								userRoleMap.set(data.Id, resultUserRole[0]);
								for (const dataUserRole of resultUserRole[0] as IRoleData[]) {
									try {
										const resultData = roleList.find((value) => value.roleName === dataUserRole.Name);
										if (resultData) {
											for (const rolePermission of resultData.permissions) {
												for (const permission of rolePermission.permission) {
													const isExist = await UserPermission.findOne({
														where: { roleId: userRole.id, loginUserId: LoginUserId },
														include: [
															{
																model: Permission,
																where: { permissionName: permission },
																include: [{ model: Feature, where: { name: rolePermission.feature } }],
															},
														],
													});
													if (!isExist) {
														const permissionData = await Permission.findOne({
															where: { permissionName: permission },
															include: [{ model: Feature, where: { name: rolePermission.feature } }],
														});
														if (userPermission.get(data.Id)) {
															const oldData = userPermission.get(data.Id);
															oldData.push({
																roleId: userRole.id,
																loginUserId: LoginUserId,
																permissionId: permissionData.permissionName,
																feature: permissionData.feature.name,
															});
															userPermission.set(data.Id, oldData);
														} else {
															userPermission.set(data.Id, [
																{
																	roleId: userRole.id,
																	loginUserId: LoginUserId,
																	permissionId: permissionData.permissionName,
																	feature: permissionData.feature.name,
																},
															]);
														}
														await UserPermission.create({
															roleId: userRole.id,
															loginUserId: LoginUserId,
															permissionId: permissionData.id,
														});
													}
												}
											}
										}
									} catch (error) {
										console.log('ERROR', error);
									}
								}
							}
						}
						console.log('Roles', userRoleMap.get(data.Id));
						console.log('permissions', userPermission.get(data.Id));
					} else {
						UserId = isUserExist.id;
					}
				}

				// User Client Migration
				if (UserId) {
					const resultUserClient = await mssqldb.query(`SELECT * FROM rd_UserClient WHERE UserName='${data.Email}'`);
					console.log('info', '--------------------Start User Client Migration--------------------');
					if (result.length) {
						for (const dataUserClient of resultUserClient[0] as IUserClientData[]) {
							try {
								const clientData = await Client.findOne({
									where: { oldClientId: dataUserClient.ClientId, deletedAt: null },
								});
								if (clientData) {
									const userClient = {
										clientId: clientData.id,
										roleId: userRole.id,
										userId: UserId,
										status: status.ACTIVE,
									};
									const isExistUserClient = await UserClient.findOne({
										where: { clientId: clientData.id, userId: UserId, deletedAt: null },
									});
									if (!isExistUserClient) await UserClient.create(userClient);
								}
							} catch (error) {
								console.log('ERROR', error);
							}
						}
					}
					console.log('info', '--------------------End User Client Migration--------------------');
				}

				// User Segment Migration
				if (UserId) {
					const resultUserSegment =
						await mssqldb.query(`SELECT rd_UserSegment.*,rd_Segment.Name as SegmentName,rd_Segment.Code as SegmentCode,rd_Segment.ClientId as SegmentClientId,rd_SubSegment.Name as SubSegmentName,
				    rd_SubSegment.Code as SubSegmentCode,rd_SubSegment.SegmentId as SubSegmentSegmentId,(SELECT seg.ClientId FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SClientId,
				    (SELECT seg.Name FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SName,
				    (SELECT seg.Code FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SCode
				    FROM rd_UserSegment
				    LEFT JOIN rd_Segment ON rd_Segment.Id=rd_UserSegment.SegmentId
				    LEFT JOIN rd_SubSegment ON rd_SubSegment.Id=rd_UserSegment.SegmentId WHERE UserName='${data.Email}'`);
					console.log('info', '--------------------Start User Segment Migration--------------------');
					if (result.length) {
						for (const dataUserSegment of resultUserSegment[0] as IUserSegmentData[]) {
							try {
								const userSegment = {
									segmentId: null,
									subSegmentId: null,
									userId: UserId,
									clientId: null,
								};
								const SegmentId = await Segment.findOne({
									where: { name: dataUserSegment.SegmentName, code: dataUserSegment.SegmentCode, deletedAt: null },
									include: [{ model: Client, where: { oldClientId: dataUserSegment.SegmentClientId } }],
								});
								if (SegmentId) {
									userSegment.segmentId = SegmentId.id;
								} else {
									const SubSegmentId = await SubSegment.findOne({
										where: {
											name: dataUserSegment.SubSegmentName,
											code: dataUserSegment.SubSegmentCode,
											deletedAt: null,
										},
										include: [
											{
												model: Segment,
												where: { name: dataUserSegment.SName, code: dataUserSegment.SCode },
												include: [{ model: Client, where: { oldClientId: dataUserSegment.SClientId } }],
											},
										],
									});
									userSegment.segmentId = SubSegmentId?.segment?.id || null;
									userSegment.subSegmentId = SubSegmentId?.id || null;
								}
								if (userSegment.segmentId || userSegment.subSegmentId) {
									const isExistUserSegment = await UserSegment.findOne({ where: userSegment });
									if (!isExistUserSegment) await UserSegment.create(userSegment);
								}
							} catch (error) {
								console.log('ERROR', error);
							}
						}
					}
					console.log('info', '--------------------End User Segment Migration--------------------');
				}

				// User Segment Approval Migration
				if (UserId) {
					const resultUserSegmentApproval =
						await mssqldb.query(`SELECT rd_UserSegmentApprove.*,rd_Segment.Name as SegmentName,rd_Segment.Code as SegmentCode,rd_Segment.ClientId as SegmentClientId,rd_SubSegment.Name as SubSegmentName,
				        rd_SubSegment.Code as SubSegmentCode,rd_SubSegment.SegmentId as SubSegmentSegmentId,(SELECT seg.ClientId FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SClientId,
				        (SELECT seg.Name FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SName,
				        (SELECT seg.Code FROM rd_Segment as seg WHERE seg.Id=rd_SubSegment.SegmentId) as SCode
				        FROM rd_UserSegmentApprove
				        LEFT JOIN rd_Segment ON rd_Segment.Id=rd_UserSegmentApprove.SegmentId
				        LEFT JOIN rd_SubSegment ON rd_SubSegment.Id=rd_UserSegmentApprove.SegmentId WHERE UserName='${data.Email}'`);
					console.log('info', '--------------------Start User Segment Approval Migration--------------------');
					if (resultUserSegmentApproval.length) {
						for (const dataUserSegmentApproval of resultUserSegmentApproval[0] as IUserSegmentData[]) {
							try {
								const userSegmentApproval = {
									segmentId: null,
									subSegmentId: null,
									userId: UserId,
									clientId: null,
								};
								const SegmentId = await Segment.findOne({
									where: {
										name: dataUserSegmentApproval.SegmentName,
										code: dataUserSegmentApproval.SegmentCode,
										deletedAt: null,
									},
									include: [{ model: Client, where: { oldClientId: dataUserSegmentApproval.SegmentClientId } }],
								});
								if (SegmentId) {
									userSegmentApproval.segmentId = SegmentId.id;
								} else {
									const SubSegmentId = await SubSegment.findOne({
										where: {
											name: dataUserSegmentApproval.SubSegmentName,
											code: dataUserSegmentApproval.SubSegmentCode,
											deletedAt: null,
										},
										include: [
											{
												model: Segment,
												where: { name: dataUserSegmentApproval.SName, code: dataUserSegmentApproval.SCode },
												include: [{ model: Client, where: { oldClientId: dataUserSegmentApproval.SClientId } }],
											},
										],
									});
									userSegmentApproval.segmentId = SubSegmentId?.segment?.id || null;
									userSegmentApproval.subSegmentId = SubSegmentId?.id || null;
								}
								if (userSegmentApproval.segmentId || userSegmentApproval.subSegmentId) {
									const isExistUserSegmentApproval = await UserSegmentApproval.findOne({
										where: userSegmentApproval,
									});
									if (!isExistUserSegmentApproval) {
										await UserSegmentApproval.create(userSegmentApproval);
									}
								}
							} catch (error) {
								console.log('ERROR', error);
							}
						}
					}
					console.log('info', '--------------------End User Segment Approval Migration--------------------');
				}
			} catch (error) {
				console.log(error);
			}
		}
	}
	console.log('info', '--------------------End User Migration--------------------');
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
