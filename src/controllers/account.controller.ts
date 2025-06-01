import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import AccountRepo from '@/repository/account.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class AccountController {
	private AccountService = new AccountRepo();
	private msg = new MessageFormation('Account').message;

	public getAllAccountData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.AccountService.getAllAccountData(req.query, req.user as User);
		// if (!XeroHelperObject.xero.readTokenSet()?.expires_in) {
		// 	const url = await XeroHelperObject.connectXero();
		// 	responseData['XeroUrl'] = url;
		// }
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Update Account Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateAccountData = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.AccountService.updateAccountDataService({
				query: req.query,
				body: req.body,
				user: req.user as User,
			});

			return generalResponse(req, res, responseData, this.msg.update, 'success', true);
		} catch (error) {
			return generalResponse(req, res, error, this.msg.wrong, 'error', true, 400);
		}
	});

	public getAllAccountDataById = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.AccountService.getAllAccountDataByIdService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public generateAccountData = catchAsync(async (req: Request, res: Response) => {
		const { clientId, startDate, endDate } = req.query;
		const responseData = await this.AccountService.generateAccountData(
			clientId as string,
			startDate as string,
			endDate as string,
			req.user as User,
		);
		// if (!XeroHelperObject.xero.readTokenSet()?.expires_in) {
		// 	const url = await XeroHelperObject.connectXero();
		// 	responseData['XeroUrl'] = url;
		// }
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default AccountController;
