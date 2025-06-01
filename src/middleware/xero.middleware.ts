import XeroHelperObject from '@/helpers/xero.helper';
import { NextFunction, Request, Response } from 'express';
import authMiddleware from './auth.middleware';
const xeroMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let tokenSet = null;
		if (XeroHelperObject.xeroToken) {
			tokenSet = await XeroHelperObject.xero.readTokenSet();
			await XeroHelperObject.xero.setTokenSet(XeroHelperObject.xeroToken);
			if (await tokenSet.expired()) {
				await XeroHelperObject.getNewTokenSet(tokenSet);
			}
			await XeroHelperObject.xero.initialize();
			await XeroHelperObject.xero.refreshToken();
			XeroHelperObject.xeroToken = await XeroHelperObject.xero.readTokenSet();
			return authMiddleware(req, res, next);
		}
		if (!tokenSet?.expires_in) {
			const url = await XeroHelperObject.connectXero();
			return res.redirect(url);
		}
	} catch (error) {
		return next();
	}
};

export default xeroMiddleware;
