import { MessageFormation } from 'constants/messages.constants';
import { HttpException } from 'exceptions/HttpException';
import NodeMailerService from 'helpers/mail/nodemailer.mail';
import { initiateReturn } from 'helpers/returnData.helper';
import { generalResponsePromise } from 'interfaces/general/general.interface';
import _ from 'lodash';
import User from 'models/user.model';
import Smtp from '../models/smtp.model';
import BaseRepository from './base.repository';

export default class SmtpRepo extends BaseRepository<Smtp> {
	constructor() {
		super(Smtp.name);
	}

	/**
	 * =============== Add Smtp Service =================
	 * @param {Prisma.SmtpCredentialsCreateInput} body
	 * @returns {Promise<generalResponsePromise>}
	 */
	private msg = new MessageFormation('Smtp').message;
	private customMessage = new MessageFormation('Smtp');

	private nodeMailerService = new NodeMailerService();

	async addSmtpService({ body, _user }: { body; _user: User }): Promise<generalResponsePromise> {
		const returnData = await initiateReturn();
		const isExist = await Smtp.findOne({ where: { username: body.username, host: body.host, deletedAt: null } });
		if (!_.isEmpty(isExist)) {
			returnData.values = {
				data: isExist, 
				message: this.msg.exist,
				toast: true
			};
			return returnData.values;
		} else {
			const bodyData = {
				...body,
			};
			const condition = body.isDefault === true ? { isDefault: true } : {};
			if (condition) {
				await this.update(
					{
						isDefault: false,
					},
					{ where: { deletedAt: null, isDefault: true } },
				);
			}

			await this.nodeMailerService.createConnection(body);
			const isValidConnection = await this.nodeMailerService.verifyConnection();
			if (!isValidConnection) {
				returnData.values = {
					data: {},
					message: this.customMessage.custom('This smtp connection is not valid.Please use other smtp connection.'),
					toast: true,
				}
				return returnData.values;
			}

			const data = await Smtp.create({ ...bodyData });
			returnData.values = {
				data,
				message: this.msg.create,
				toast: true
			}
			return returnData.values;
		}
	}

	/**
	 * =============== Update Smtp Service =================
	 * @param {Prisma.SmtpCredentialsCreateInput & {id:number}} body
	 * @returns {Promise<generalResponsePromise>}
	 */
	async updateSmtpService({ body, id }: { body; id: number }): Promise<generalResponsePromise> {
		const returnData = await initiateReturn();
		const condition = body.isDefault === true ? { isDefault: true } : {};

		const isExist = await this.get({ where: { id } });
		if (!isExist) throw new HttpException(400, this.msg.notFound);
		else {
			if (!_.isEmpty(condition)) {
				await Smtp.update(
					{
						isDefault: false,
					},
					{ where: { deletedAt: null, isDefault: true } },
				);
			} else if (!body.isDefault) {
				const isDefault = await this.get({ where: { isDefault: true, deletedAt: null } });
				if (!isDefault)
					throw new HttpException(400, this.customMessage.custom('At least one default smtp should be there.'));
			}
			await this.nodeMailerService.createConnection(body);
			const isValidConnection = await this.nodeMailerService.verifyConnection();
			if (!isValidConnection) {
				throw new HttpException(
					400,
					this.customMessage.custom('This smtp connection is not valid.Please use other smtp connection.'),
				);
			}
			const data = await Smtp.update(body, { where: { id: +id } });

			returnData.values = {
				data, 
				message: this.msg.update,
				toast: true
			};

			return returnData.values;
		}
	}

	//===============  Smtp SERVICE ===============
	async deleteSmtp(id: number) {
		const findDuplicateData = await this.get({ where: { id } });
		if (!findDuplicateData?.id) throw new Error(this.msg.notFound);
		if (findDuplicateData.isDefault) {
			throw new HttpException(400, this.customMessage.custom('This SMTP cannot be deleted as it is default SMTP.'));
		}
		const result = await this.update({
			deletedAt: new Date(),
		});

		return result;
	}
}
