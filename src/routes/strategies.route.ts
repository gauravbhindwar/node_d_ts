import { SERVER_URL } from 'config';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';
import { Strategy } from 'interfaces/model/strategy.interface';
import passport from 'passport';
import Strategies from 'strategies';

export default class StrategiesRoutes implements Routes {
	readonly router = Router();
	private readonly strategies: Strategy[];

	constructor() {
		this.strategies = this.getStrategies();
		this.setPassportStrategies();
	}

	private readonly getStrategies = () => {
		return Strategies.getStrategies(process.env, `${SERVER_URL}/api/auth`);
	};

	// private readonly setZoomConnectRoutes = () => {
	// 	this.router.route('/api/auth/zoom/connect').get(ZoomAuth.connectZoom);
	// 	this.router.route('/api/auth/zoom/callback').get(ZoomAuth.authWithZoom);
	// };

	private readonly setPassportStrategies = () => {
		this.strategies.forEach((strategy) => {
			passport.use(new strategy.Ctor(strategy?.config, strategy.toUser));
		});
		passport.serializeUser((user, done) => done(null, user));
		passport.deserializeUser((user: Express.User, done) => done(null, user));
	};

	// private readonly setPassportRoutes = () => {
	// 	if (this.strategies.length > 0) {
	// 		const opts = {
	// 			strategies: this.strategies,
	// 			env: process.env,
	// 		};
	// 		const controller = new StrategyController(opts);
	// 		const filteredStrategies = this.strategies.filter((strategy) => strategy.type !== 'jwt');
	// 		this.router.get(
	// 			filteredStrategies.map((strategy) => `/api/auth/${strategy.type}/connect`),
	// 			controller.onAuthenticationRequest,
	// 		);
	// 		this.router.get(
	// 			filteredStrategies.map((strategy) => `/api/auth/${strategy.type}/callback`),
	// 			controller.onAuthenticationCallback,
	// 		);
	// 	}
	// };
}
