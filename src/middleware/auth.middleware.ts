import { AUTH_MESSAGES } from 'constants/auth.messages';
import { NextFunction, Request, Response } from 'express';
import User from 'models/user.model';
import passport from 'passport';
import generalResponse from 'utils/generalResponse';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return generalResponse(req, res, [], AUTH_MESSAGES.TOKEN_EXPIRED, 'error', false, 401);
		} else {
			req.user = user as User;
			return next();
		}
	})(req, res, next);
};

export default authMiddleware;
