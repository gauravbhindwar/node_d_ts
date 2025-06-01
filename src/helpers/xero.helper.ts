import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import { folderExistCheck, parse } from '@/utils/common.util';
import {
	FRONTEND_URL,
	SERVER_URL,
	XERO_ACTIVE_TENANT,
	XERO_BRANDING_THEME,
	XERO_CLIENT_ID,
	XERO_CLIENT_SECRET,
} from '@config';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { Op } from 'sequelize';
import { Contacts, XeroClient } from 'xero-node';

class XeroHelper {
	public xero = null;
	public xeroToken = null;
	public activeTenant: any = {};
	public activeTenantId = XERO_ACTIVE_TENANT;
	public brandingTheme = XERO_BRANDING_THEME;
	constructor() {
		this.xero = new XeroClient({
			clientId: XERO_CLIENT_ID,
			clientSecret: XERO_CLIENT_SECRET,
			redirectUris: [`${SERVER_URL}xero/callback`],
			scopes:
				'offline_access openid profile email accounting.transactions accounting.budgets.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings'.split(
					' ',
				),
		});

		if (folderExistCheck('./xeroFile/')) {
			if (fs.existsSync('./xeroFile/xeroTokenSet.txt')) {
				this.xeroToken = JSON.parse(`${fs.readFileSync('./xeroFile/xeroTokenSet.txt')}`);
				this.xero.setTokenSet(this.xeroToken);
			} else {
				this.xeroToken = null;
			}
		}
	}

	readonly getNewTokenSet = async (tokenSet) => {
		try {
			if (tokenSet.expired()) {
				await this.xero.initialize();
				const newXeroClient = new XeroClient();
				const newTokenSet = await newXeroClient.refreshWithRefreshToken(
					XERO_CLIENT_ID,
					XERO_CLIENT_SECRET,
					tokenSet.refresh_token,
				);
				fs.writeFileSync('./xeroFile/xeroTokenSet.txt', JSON.stringify(newTokenSet));
				this.xero.setTokenSet(newTokenSet);
				this.xeroToken = newTokenSet;
			}
			return this.xeroToken;
		} catch (e) {
			console.error('an error occured.', e);
		}
	};

	public async connectXero() {
		try {
			const consentUrl: string = await this.xero.buildConsentUrl();
			return consentUrl;
		} catch (error) {
			console.error('an error occured', error);
		}
	}

	public async handleCallBack(req: Request, res: Response) {
		const tokenSet = await XeroHelperObject.xero.apiCallback(req.url);
		fs.writeFileSync('./xeroFile/xeroTokenSet.txt', JSON.stringify(tokenSet));
		XeroHelperObject.xeroToken = tokenSet;
		XeroHelperObject.xero.setTokenSet(tokenSet);
		await XeroHelperObject.xero.updateTenants(false);
		return res.redirect(`${FRONTEND_URL}/accounts`);
	}

	// fetch all the employees form Xero and returns them to the FE
	readonly getAllContacts = async () => {
		try {
			const getContactsResponse = await this.xero.accountingApi.getContacts(this.activeTenantId);
			return getContactsResponse.body.contacts;
		} catch (e) {
			console.error('an error occured', e);
		}
	};

	public async generateMigration(clientId = null) {
		const condition = clientId ? { clientId } : { xeroContactId: { [Op.is]: null } };
		const allEmployees = await Employee.findAll({
			attributes: ['id', 'employeeNumber'],
			include: [
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName', 'email'],
				},
			],
			where: condition,
		}).then((parsers) => parse(parsers));
		const promises = [];
		for (const emp of allEmployees) {
			const promise = await new Promise(async (resolve, reject) => {
				try {
					const contact: Contacts = {
						contacts: [
							{
								name: `${emp?.loginUserData?.firstName} ${emp?.loginUserData?.lastName} : ${Math.floor(
									Math.random() * 1000000,
								)}`,
								firstName: emp?.loginUserData?.firstName,
								lastName: emp?.loginUserData?.lastName,
								emailAddress: emp?.loginUserData?.email,
							},
						],
					};
					const addedContact = await XeroHelperObject.xero.accountingApi.createContacts(
						XeroHelperObject.activeTenantId,
						contact,
					);
					if (addedContact?.body?.contacts[0].contactID) {
						await Employee.update(
							{ xeroContactId: addedContact?.body?.contacts[0].contactID },
							{ where: { id: emp?.id } },
						);
						resolve(addedContact?.body?.contacts[0].contactID);
					} else {
						resolve(true);
					}
				} catch (error) {
					reject(error);
				}
			});
			promises.push(promise);
			await promise;
		}
		return await Promise.all(promises);
	}
}

const XeroHelperObject = new XeroHelper();

export default XeroHelperObject;
