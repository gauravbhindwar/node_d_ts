import XeroHelperObject from '@/helpers/xero.helper';
import AccountPO from '@/models/accountPO.model';
import Employee from '@/models/employee.model';
import { parse } from '@/utils/common.util';
import { Request, Response } from 'express';
import moment from 'moment';
import { Invoice, Invoices, LineAmountTypes } from 'xero-node';
import { catchAsync } from '../utils/catchAsync';
import generalResponse from '../utils/generalResponse';
class XeroController {
	/**
	 * get user Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */

	public migrateEmployees = catchAsync(async (req: Request, res: Response) => {
		try {
			const clientId = req.body?.clientId || null;
			const finalResp = await XeroHelperObject.generateMigration(clientId);
			return generalResponse(req, res, finalResp, 'response fetched successfully', 'success', false);
		} catch (error) {
			return generalResponse(req, res, error?.response?.body, 'response fetched successfully', 'fail', true, 400);
		}
	});

	public generateInvoice = catchAsync(async (req: Request, res: Response) => {
		try {
			const employeeId = req.params.employeeId;
			const empdetail = await Employee.findOne({ where: { id: employeeId } }).then((parsedata) => parse(parsedata));
			const invoice1: Invoice = {
				type: Invoice.TypeEnum.ACCREC,
				// type: Invoice.TypeEnum.ACCPAY,
				contact: {
					contactID: empdetail.xeroContactId,
				},
				// invoiceNumber: `XERO:${Math.floor(Math.random() * 1000000)}`,
				invoiceNumber: req.body.invoiceNumber,
				// reference: `REF:${Math.floor(Math.random() * 1000000)}`,
				brandingThemeID: XeroHelperObject.brandingTheme,
				url: 'https://lred.appdemoserver.com/',
				hasAttachments: false,
				status: Invoice.StatusEnum.SUBMITTED,
				// status: Invoice.StatusEnum.AUTHORISED,
				lineAmountTypes: LineAmountTypes.Inclusive,
				date: moment(req.body.approveDate, 'DD/MM/YYYY').toISOString(),
				dueDate: moment(req.body.approveDate, 'DD/MM/YYYY').toISOString(),
				lineItems: [...req.body.invoiceItems],
			};

			// Array of Invoices needed
			const newInvoices: Invoices = new Invoices();
			newInvoices.invoices = [invoice1];
			const isExist = await AccountPO.findOne({
				where: { id: req.body.poId },
			}).then((dat) => parse(dat));
			let invoiceId = null;
			if (!isExist?.invoiceId) {
				const createdInvoice = await XeroHelperObject.xero.accountingApi.createInvoices(
					XeroHelperObject.activeTenantId,
					newInvoices,
				);
				await AccountPO.update(
					{ invoiceId: createdInvoice.body.invoices[0].invoiceID },
					{ where: { id: req.body.poId }, individualHooks: true },
				);
				invoiceId = createdInvoice.body.invoices[0].invoiceID;
			} else {
				invoiceId = isExist?.invoiceId;
			}

			// GET one as PDF
			const getAsPdf = await XeroHelperObject.xero.accountingApi.getInvoiceAsPdf(
				XeroHelperObject.activeTenantId,
				invoiceId,
				{ headers: { accept: 'application/pdf' } },
			);
			return generalResponse(
				req,
				res,
				Buffer.from(getAsPdf.body).toString('base64'),
				'response fetched successfully',
				'success',
				false,
			);
		} catch (error) {
			return generalResponse(req, res, 'error', error, 'failed', false, 400);
		}
	});
}

export default XeroController;
