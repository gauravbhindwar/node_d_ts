import { status } from '@/interfaces/model/user.interface';
import Client from '@/models/client.model';
import ClientTimesheetStartDay from '@/models/clientTimesheetStartDay.model';
import LoginUser from '@/models/loginUser.model';
import Role from '@/models/role.model';
import RolePermission from '@/models/rolePermission.model';
import User from '@/models/user.model';
import UserClient from '@/models/userClient.model';
import UserPermission from '@/models/userPermission.model';
import ClientRepo from '@/repository/client.repository';
import { generateUniquePassword, parse } from '@/utils/common.util';
import moment from 'moment';
import slugify from 'slugify';
import mssqldb from '@/mssqldb';
import { sendMail } from '@/helpers/mail.helper';
import { FRONTEND_URL } from '@/config';

const clientRepo = new ClientRepo();

interface IClientData {
	Id: string;
	Name: string;
	StartDate: Date | string | null;
	EndDate: Date | string | null;
	EndDateMonths: number | null;
	TimesheetStartDay: number | null;
	ApprovedEmail: string | null;
	HolidayEmail: string | null;
	MedicalEmail: string | null;
	MedicalDailyEmail: string | null;
	MedicalMonthlyEmail: string | null;
	CountryId: number | null;
	ShowPricesInTimesheet: boolean | number;
	ShowSegmentName: boolean | number;
	ShowNSS: boolean | number;
	ShowMedicalInsurance: boolean | number;
	ShowSalaryInfo: boolean | number;
	ShowCostCentre: boolean | number;
	ShowCatalogueNo: boolean | number | null;
	BonusTypeName: string;
	ShowRotation: boolean | number;
	ShowBalance: boolean | number;
	SegmentName: string;
	SubSegmentName: string;
	Logo: string | null;
	Code: string | null;
	ImportFilenamePrefix: string | null;
	ImportFilenameSuffix: string | null;
	ResetBalanceSegmentChange: boolean;
	Active: boolean;
	HolidayMonths: number;
	NiceName: string | null;
}

(async function injectClient() {
	// Start Client Migration *********************************
	const result = await mssqldb.query(
		'SELECT rd_Client.*,rd_Country.Name as CountryName,rd_Country.NiceName FROM rd_Client INNER JOIN rd_Country ON rd_Country.Id = rd_Client.CountryId',
	);
	console.log('info', '------------------------- Start Client Migration -------------------------');
	if (result.length) {
		for (const data of result[0] as IClientData[]) {
			try {
				const email = data.Name?.replace(/\s/g, '') + '@lredtest.com';
				const isExistClient = await clientRepo.get({
					where: { deletedAt: null },
					include: [{ model: LoginUser, where: { email: email, deletedAt: null } }],
				});
				const randomPassword = generateUniquePassword();
				const uniqueSlug = data.Name + data.Code;
				const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });
				const loginData = {
					email: email,
					name: data.Name,
					timezone: null,
					randomPassword: randomPassword,
					profileImage: data.Logo ? data.Logo : null,
					code: randomPassword, // Temporory add this field
					uniqueLoginId: null,
				};
				const clientData = {
					slug,
					loginUserId: null,
					code: data.Code,
					country: data.NiceName,
					timezone: null,
					isActive: data.Active,
					startDate: moment(data.StartDate).toDate(),
					endDate: moment(data.EndDate).toDate(),
					autoUpdateEndDate: data.EndDateMonths,
					timeSheetStartDay: data.TimesheetStartDay,
					approvalEmail: data.ApprovedEmail ? data.ApprovedEmail.toString() : null,
					isShowPrices: data.ShowPricesInTimesheet as boolean,
					isShowCostCenter: data.ShowCostCentre as boolean,
					isShowCatalogueNo: data.ShowCatalogueNo as boolean,
					titreDeConge: data.HolidayEmail ? data.HolidayEmail.toString() : null,
					isResetBalance: data.ResetBalanceSegmentChange,
					startMonthBack: data.HolidayMonths,
					medicalEmailSubmission: data.MedicalEmail ? data.MedicalEmail.toString() : '',
					medicalEmailToday: data.MedicalDailyEmail ? data.MedicalDailyEmail.toString() : '',
					medicalEmailMonthly: data.MedicalMonthlyEmail ? data.MedicalMonthlyEmail.toString() : '',
					isShowSegmentName: data.ShowSegmentName as boolean,
					isShowNSS: data.ShowNSS as boolean,
					isShowCarteChifa: data.ShowMedicalInsurance as boolean,
					isShowSalaryInfo: data.ShowSalaryInfo as boolean,
					isShowRotation: data.ShowRotation as boolean,
					isShowBalance: data.ShowBalance as boolean,
					logo: data.Logo,
					segment: data.SegmentName,
					subSegment: data.SubSegmentName,
					bonusType: data.BonusTypeName,
					oldClientId: data.Id,
				};
				if (!isExistClient) {
					const loginUserData = await LoginUser.create(loginData);
					clientData.loginUserId = loginUserData.id;
					const resultClientData = await Client.create(clientData);
					await ClientTimesheetStartDay.create({
						clientId: resultClientData.id,
						timesheetStartDay: data.TimesheetStartDay,
						date: moment(moment(moment(data.StartDate).toDate()).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					});
					const roleData = await Role.findOne({
						where: {
							name: 'Client',
							deletedAt: null,
						},
						include: {
							model: RolePermission,
							attributes: ['permissionId'],
						},
					});
					if (roleData) {
						const userData = await User.create({
							loginUserId: loginUserData.id,
							roleId: roleData.id,
							status: status.ACTIVE,
						});
						if (userData) {
							await UserClient.create({
								clientId: resultClientData.id,
								roleId: roleData.id,
								userId: userData.id,
								status: status.ACTIVE,
							});
							for (const permissions of roleData.assignedPermissions) {
								await UserPermission.create({
									permissionId: permissions.permissionId,
									loginUserId: loginUserData.id,
									roleId: roleData.id,
								});
								await UserPermission.create({
									clientId: resultClientData.id,
									permissionId: permissions.permissionId,
									loginUserId: loginUserData.id,
									roleId: roleData.id,
								});
							}
							const replacement = {
								username: data.Name,
								useremail: email,
								password: randomPassword,
								logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
							 url: FRONTEND_URL,
							};
							if (email) {
								// await sendMail([email,'admin@lred.com'], 'Credentials', 'userCredentials', replacement);
							}
						}
					}
				} else {
					delete loginData.randomPassword;
					delete clientData.loginUserId;
					await LoginUser.update(loginData, { where: { id: isExistClient.loginUserId } });
					await Client.update(clientData, { where: { id: isExistClient.id } });
					if (isExistClient.timeSheetStartDay !== data.TimesheetStartDay) {
						let ifExist = await ClientTimesheetStartDay.findOne({
							where: {
								clientId: isExistClient.id,
								date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
							},
						});
						ifExist = parse(ifExist);
						const clientTimesheetData = {
							clientId: isExistClient.id,
							timesheetStartDay: data.TimesheetStartDay,
							date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						};
						if (!ifExist) {
							await ClientTimesheetStartDay.create(clientTimesheetData);
						} else {
							await ClientTimesheetStartDay.update(clientTimesheetData, {
								where: {
									clientId: isExistClient.id,
									date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
								},
							});
						}
					}
				}
			} catch (error) {
				console.log('ERROR', error);
			}
		}
	}
	console.log('info', '-------------------------End Client Migration-------------------------');
	// End Client Migration *********************************
})().catch((err) => {
	// eslint-disable-next-line no-console
	console.log('error', err.message);
});
