import { Strategy } from 'interfaces/model/strategy.interface';
import { ExtractJwt, Strategy as JWTStrategy, VerifyCallback } from 'passport-jwt';
import UserRepo from 'repository/user.repository';

export default class JWT extends Strategy {
	Ctor = JWTStrategy;
	type = 'jwt';
	constructor() {
		super();
	}

	readonly getConfig = (env: NodeJS.ProcessEnv, _callbackURL: string) => {
		return {
			jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
			secretOrKey: env.JWT_SECRET,
		};
	};

	toUser: VerifyCallback = async (JWTPayload, done) => {
		try {
			const user = await UserRepo.getLoginUserData(JWTPayload.email);
			if (user) {
				done(null, user);
			} else {
				done(null, false);
			}
		} catch (err) {
			done(err);
		}
	};
}
