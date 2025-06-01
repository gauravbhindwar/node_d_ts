import { SMTP_MAIL_HOST, SMTP_MAIL_PASSWORD, SMTP_MAIL_USER } from 'config';
import { HttpException } from 'exceptions/HttpException';
import nodemailer from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';
export default class NodeMailerService {
	private transporter: nodemailer.Transporter;

	readonly createConnection = async (options: {
		host?: string;
		port?: number;
		secure?: boolean;
		username?: string;
		password?: string;
	}) => {
		this.transporter = nodemailer.createTransport({
			host: options.host || SMTP_MAIL_HOST || 'smtp.gmail.com',
			port: options.port || 587,
			secure: options.secure || false,
			auth: {
				user: options.username || SMTP_MAIL_USER || 'jeel.shah.2210@gmail.com',
				pass: options.password || SMTP_MAIL_PASSWORD || 'ebbkrpkymbrvbajm',
			},
		});

		return this;
	};

	async sendMail(options: Options) {
		const details = await this.transporter
			.sendMail({
				from: options.from,
				to: options.to,
				cc: options.cc,
				bcc: options.bcc,
				subject: options?.subject,
				text: options?.text,
				html: options?.html,
				attachments: options.attachments,
			})
			.then((info) => {
				console.log('info-----------------', info);
				return info;
			})
			.catch((err) => {
				console.log('err--------', err);
				
				throw new HttpException(400, err.message);
			});   
		return details;
	}

	async verifyConnection() {
		try {
			return await this.transporter.verify();
		} catch (error) {
			return false;
		}
	}

	getTransporter() {
		return this.transporter;
	}
}
